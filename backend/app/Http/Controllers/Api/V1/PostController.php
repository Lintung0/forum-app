<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Post\StorePostRequest;
use App\Http\Requests\Post\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Comment;
use App\Models\Post;
use App\Models\PostEditHistory;
use App\Models\Tag;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PostController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $posts = Post::query()
            ->with(['user', 'category', 'tags'])
            ->withCount(['comments' => fn($q) => $q->active()])
            ->when(
                $request->input('status', 'open') !== 'all',
                fn($q) => $q->where('status', $request->input('status', 'open'))
            )
            ->when(
                $request->filled('category_id'),
                fn($q) => $q->where('category_id', $request->input('category_id'))
            )
            ->when(
                $request->filled('tag'),
                fn($q) => $q->whereHas('tags', fn($tq) => $tq->where('slug', $request->input('tag')))
            )
            ->when(
                $request->filled('user_id'),
                fn($q) => $q->where('user_id', $request->input('user_id'))
            )
            ->when(
                $request->filled('q'),
                fn($q) => $q->where(function ($query) use ($request) {
                    $kw = '%' . $request->input('q') . '%';
                    $query->where('title', 'like', $kw)
                          ->orWhere('body', 'like', $kw);
                })
            )
            ->when(true, function ($q) use ($request) {
                match ($request->input('sort', 'newest')) {
                    'oldest', 'latest' => $q->orderBy('created_at', $request->input('sort') === 'latest' ? 'desc' : 'asc'),
                    'popular', 'votes' => $q->orderByDesc('vote_score'),
                    'views'            => $q->orderByDesc('view_count'),
                    'unanswered'       => $q->where('is_answered', false)->orderByDesc('created_at'),
                    default            => $q->orderByDesc('created_at'),
                };
            })
            ->when($user, function ($q) use ($user) {
                $q->with([
                    'currentUserVote' => fn($vq) => $vq->where('user_id', $user->id),
                    'currentUserBookmark' => fn($bq) => $bq->where('user_id', $user->id),
                ]);
            })
            ->paginate(min((int) $request->input('per_page', 15), 50));

        return $this->paginatedResponse(
            $posts->through(fn($post) => new PostResource($post)),
            'Daftar post berhasil diambil.'
        );
    }

    public function store(StorePostRequest $request): JsonResponse
    {
        try {
            $post = DB::transaction(function () use ($request) {
                $post = Post::create([
                    'user_id'     => $request->user()->id,
                    'category_id' => $request->input('category_id'),
                    'title'       => $request->input('title'),
                    'body'        => $request->input('body'),
                    'status'      => 'open',
                ]);

                if ($request->filled('tags')) {
                    $tagIds = collect($request->input('tags'))->map(function ($tag) {
                        // Support nama tag (string) atau UUID
                        if (!\Illuminate\Support\Str::isUuid($tag)) {
                            $model = Tag::firstOrCreate(
                                ['slug' => \Illuminate\Support\Str::slug($tag)],
                                ['name' => $tag]
                            );
                            return $model->id;
                        }
                        return $tag;
                    })->toArray();

                    $post->tags()->attach($tagIds);
                    Tag::whereIn('id', $tagIds)->increment('usage_count');
                }

                return $post;
            });

            $post->load(['user', 'category', 'tags']);

            return $this->createdResponse(
                new PostResource($post),
                'Post berhasil dibuat.'
            );

        } catch (\Throwable $e) {
            return $this->errorResponse(
                'Gagal membuat post.',
                app()->environment('production') ? null : $e->getMessage(),
                500
            );
        }
    }

    public function show(Request $request, Post $post): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! $post->isOwnedBy($user)) {
            $cacheKey = 'post_view:' . $post->id . ':' . $request->ip();
            if (! Cache::has($cacheKey)) {
                $post->incrementViewCount();
                Cache::put($cacheKey, true, now()->addMinutes(15));
            }
        }

        $post->load([
            'user',
            'category',
            'tags',
            'acceptedAnswer.user',
            'topLevelComments' => fn($q) => $q->active()->with(['user', 'replies' => fn($rq) => $rq->active()->with('user')])->withCount(['replies' => fn($rq) => $rq->active()]),
        ]);
        $post->loadCount(['comments' => fn($q) => $q->active()]);

        if ($user) {
            $post->load([
                'currentUserVote' => fn($q) => $q->where('user_id', $user->id),
                'currentUserBookmark' => fn($q) => $q->where('user_id', $user->id),
            ]);
        }

        return $this->successResponse(
            new PostResource($post),
            'Detail post berhasil diambil.'
        );
    }

    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        $user = $request->user();

        if (! $post->isOwnedBy($user) && ! $user->isModerator()) {
            return $this->forbiddenResponse('Anda tidak berhak mengubah post ini.');
        }

        if (! $post->isOpen()) {
            return $this->errorResponse('Post yang sudah ditutup atau dihapus tidak dapat diedit.', null, 422);
        }

        try {
            DB::transaction(function () use ($request, $post, $user) {
                $oldBody = $post->body;
                $newBody = $request->input('body', $post->body);

                if ($oldBody !== $newBody) {
                    PostEditHistory::create([
                        'post_id'     => $post->id,
                        'edited_by'   => $user->id,
                        'body_before' => $oldBody,
                        'body_after'  => $newBody,
                        'reason'      => $request->input('reason'),
                    ]);
                }

                $post->update(array_filter([
                    'title'       => $request->input('title'),
                    'body'        => $request->input('body'),
                    'category_id' => $request->input('category_id'),
                ], fn($v) => $v !== null));

                if ($request->has('tags')) {
                    $oldTagIds = $post->tags()->pluck('tags.id')->toArray();
                    $newTagIds = collect($request->input('tags', []))->map(function ($tag) {
                        if (!\Illuminate\Support\Str::isUuid($tag)) {
                            $model = Tag::firstOrCreate(
                                ['slug' => \Illuminate\Support\Str::slug($tag)],
                                ['name' => $tag]
                            );
                            return $model->id;
                        }
                        return $tag;
                    })->toArray();

                    $removedTagIds = array_diff($oldTagIds, $newTagIds);
                    $addedTagIds   = array_diff($newTagIds, $oldTagIds);

                    if (! empty($removedTagIds)) {
                        Tag::whereIn('id', $removedTagIds)->where('usage_count', '>', 0)->decrement('usage_count');
                    }
                    if (! empty($addedTagIds)) {
                        Tag::whereIn('id', $addedTagIds)->increment('usage_count');
                    }

                    $post->tags()->sync($newTagIds);
                }
            });

            $post->refresh()->load(['user', 'category', 'tags']);

            return $this->successResponse(new PostResource($post), 'Post berhasil diupdate.');

        } catch (\Throwable $e) {
            return $this->errorResponse(
                'Gagal mengupdate post.',
                app()->environment('production') ? null : $e->getMessage(),
                500
            );
        }
    }

    public function destroy(Request $request, Post $post): JsonResponse
    {
        $user = $request->user();

        if (! $post->isOwnedBy($user) && ! $user->isModerator()) {
            return $this->forbiddenResponse('Anda tidak berhak menghapus post ini.');
        }

        if ($post->isDeleted()) {
            return $this->errorResponse('Post sudah dihapus sebelumnya.', null, 422);
        }

        try {
            DB::transaction(function () use ($post) {
                $tagIds = $post->tags()->pluck('tags.id')->toArray();
                if (! empty($tagIds)) {
                    Tag::whereIn('id', $tagIds)->where('usage_count', '>', 0)->decrement('usage_count');
                }
                $post->update(['status' => 'deleted']);
            });

            return $this->noContentResponse('Post berhasil dihapus.');

        } catch (\Throwable $e) {
            return $this->errorResponse(
                'Gagal menghapus post.',
                app()->environment('production') ? null : $e->getMessage(),
                500
            );
        }
    }

    public function acceptAnswer(Request $request, Post $post, Comment $comment): JsonResponse
    {
        if (! $post->isOwnedBy($request->user())) {
            return $this->forbiddenResponse('Hanya pemilik post yang bisa menerima jawaban.');
        }

        if ($comment->post_id !== $post->id) {
            return $this->errorResponse('Komentar bukan bagian dari post ini.', null, 422);
        }

        if ($comment->isReply()) {
            return $this->errorResponse('Reply tidak bisa dijadikan accepted answer.', null, 422);
        }

        try {
            DB::transaction(function () use ($post, $comment, $request) {
                if ($post->accepted_answer_id) {
                    Comment::where('id', $post->accepted_answer_id)->update(['is_accepted' => false]);
                }

                $comment->update(['is_accepted' => true]);
                $post->update([
                    'accepted_answer_id' => $comment->id,
                    'is_answered'        => true,
                ]);

                NotificationService::send(
                    $comment->user_id,
                    $request->user()->id,
                    'answer_accepted',
                    $comment->id,
                    'comment'
                );
            });

            return $this->successResponse(null, 'Jawaban berhasil diterima.');

        } catch (\Throwable $e) {
            return $this->errorResponse(
                'Gagal menerima jawaban.',
                app()->environment('production') ? null : $e->getMessage(),
                500
            );
        }
    }

    public function close(Request $request, Post $post): JsonResponse
    {
        if ($post->isDeleted()) {
            return $this->errorResponse('Tidak dapat menutup post yang sudah dihapus.', null, 422);
        }

        $post->update(['status' => 'closed']);
        $post->refresh()->load(['user', 'category', 'tags']);

        return $this->successResponse(new PostResource($post), 'Post berhasil ditutup oleh moderator.');
    }

    public function reopen(Request $request, Post $post): JsonResponse
    {
        if (! $post->isClosed()) {
            return $this->errorResponse('Post ini tidak dalam status tertutup.', null, 422);
        }

        $post->update(['status' => 'open']);
        $post->refresh()->load(['user', 'category', 'tags']);

        return $this->successResponse(new PostResource($post), 'Post berhasil dibuka ulang oleh moderator.');
    }

    public function forceDestroy(Request $request, Post $post): JsonResponse
    {
        if ($post->isDeleted()) {
            return $this->errorResponse('Post sudah dihapus sebelumnya.', null, 422);
        }

        DB::transaction(function () use ($post) {
            $tagIds = $post->tags()->pluck('tags.id')->toArray();
            if (! empty($tagIds)) {
                Tag::whereIn('id', $tagIds)->where('usage_count', '>', 0)->decrement('usage_count');
            }
            $post->update(['status' => 'deleted']);
        });

        return $this->noContentResponse('Post berhasil dihapus oleh moderator.');
    }

}
