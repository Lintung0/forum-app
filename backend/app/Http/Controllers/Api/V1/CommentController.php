<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Comment\StoreCommentRequest;
use App\Http\Requests\Comment\UpdateCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\CommentEditHistory;
use App\Models\Post;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommentController extends Controller
{
    use ApiResponse;

    public function index(Request $request, Post $post): JsonResponse
    {
        $comments = $post->topLevelComments()
            ->where('is_deleted', false)
            ->with(['user', 'replies' => fn($q) => $q->where('is_deleted', false)->with('user')->orderBy('created_at')])
            ->withCount('replies')
            ->paginate(min((int) $request->input('per_page', 20), 50));

        return $this->paginatedResponse(
            $comments->through(fn($c) => new CommentResource($c)),
            'Daftar komentar berhasil diambil.'
        );
    }

    public function store(StoreCommentRequest $request, Post $post): JsonResponse
    {
        if (! $post->isOpen()) {
            return $this->errorResponse('Tidak bisa berkomentar pada post yang sudah ditutup.', null, 422);
        }

        $parentId      = $request->input('parent_id');
        $parentComment = null;

        if ($parentId) {
            $parentComment = Comment::find($parentId);
            if (! $parentComment || $parentComment->post_id !== $post->id) {
                return $this->errorResponse('Komentar induk tidak ditemukan di post ini.', null, 422);
            }
        }

        try {
            $comment = DB::transaction(function () use ($request, $post, $parentId, $parentComment) {
                $actorId = $request->user()->id;

                $comment = Comment::create([
                    'post_id'   => $post->id,
                    'user_id'   => $actorId,
                    'parent_id' => $parentId,
                    'body'      => $request->input('body'),
                ]);

                $comment->load('user');

            if ($parentComment) {
                if ($parentComment->user_id !== $actorId) {
                    NotificationService::send($parentComment->user_id, $actorId, 'new_reply', $comment->id, 'comment');
                }
                if ($post->user_id !== $parentComment->user_id && $post->user_id !== $actorId) {
                    NotificationService::send($post->user_id, $actorId, 'new_comment', $comment->id, 'comment');
                }
            } else {
                if ($post->user_id !== $actorId) {
                    NotificationService::send($post->user_id, $actorId, 'new_comment', $comment->id, 'comment');
                }
            }

            return $this->createdResponse(new CommentResource($comment), 'Komentar berhasil ditambahkan.');

        } catch (\Throwable $e) {
            return $this->errorResponse(
                'Gagal menambahkan komentar.',
                app()->environment('production') ? null : $e->getMessage(),
                500
            );
        }
    }

    public function show(Post $post, Comment $comment): JsonResponse
    {
        if ($comment->post_id !== $post->id) {
            return $this->notFoundResponse('Komentar tidak ditemukan di post ini.');
        }

        $comment->load(['user', 'replies.user']);
        $comment->loadCount('replies');

        return $this->successResponse(new CommentResource($comment), 'Detail komentar berhasil diambil.');
    }

    public function update(UpdateCommentRequest $request, Post $post, Comment $comment): JsonResponse
    {
        $user = $request->user();

        if ($comment->post_id !== $post->id) {
            return $this->notFoundResponse('Komentar tidak ditemukan di post ini.');
        }

        if (! $comment->isOwnedBy($user) && ! $user->isModerator()) {
            return $this->forbiddenResponse('Anda tidak berhak mengubah komentar ini.');
        }

        try {
            DB::transaction(function () use ($request, $comment, $user) {
                $oldBody = $comment->body;
                $newBody = $request->input('body');

                if ($oldBody !== $newBody) {
                    CommentEditHistory::create([
                        'comment_id'  => $comment->id,
                        'edited_by'   => $user->id,
                        'body_before' => $oldBody,
                        'body_after'  => $newBody,
                    ]);
                    $comment->update(['body' => $newBody]);
                }
            });

            return $this->successResponse(
                new CommentResource($comment->refresh()->load('user')),
                'Komentar berhasil diupdate.'
            );

        } catch (\Throwable $e) {
            return $this->errorResponse(
                'Gagal mengupdate komentar.',
                app()->environment('production') ? null : $e->getMessage(),
                500
            );
        }
    }

    public function destroy(Request $request, Post $post, Comment $comment): JsonResponse
    {
        $user = $request->user();

        if ($comment->post_id !== $post->id) {
            return $this->notFoundResponse('Komentar tidak ditemukan di post ini.');
        }

        if (! $comment->isOwnedBy($user) && ! $user->isModerator()) {
            return $this->forbiddenResponse('Anda tidak berhak menghapus komentar ini.');
        }

        if ($comment->isSoftDeleted()) {
            return $this->errorResponse('Komentar sudah dihapus sebelumnya.', null, 422);
        }

        if ($comment->is_accepted) {
            $post->update(['accepted_answer_id' => null, 'is_answered' => false]);
        }

        $comment->update(['is_deleted' => true]);

        return $this->noContentResponse('Komentar berhasil dihapus.');
    }

    public function forceDestroy(Request $request, Comment $comment): JsonResponse
    {
        if ($comment->isSoftDeleted()) {
            return $this->errorResponse('Komentar sudah dihapus sebelumnya.', null, 422);
        }

        if ($comment->is_accepted) {
            $post = Post::find($comment->post_id);
            if ($post && $post->accepted_answer_id === $comment->id) {
                $post->update(['is_answered' => false, 'accepted_answer_id' => null]);
            }
        }

        $comment->update(['is_deleted' => true]);

        return $this->noContentResponse('Komentar berhasil dihapus oleh moderator.');
    }
}
