<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Bookmark\StoreBookmarkRequest;
use App\Http\Resources\BookmarkResource;
use App\Models\Bookmark;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookmarkController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $bookmarks = Bookmark::where('user_id', $request->user()->id)
            ->with(['post.user'])
            ->latest()
            ->paginate(15);

        return $this->paginatedResponse(
            $bookmarks->through(fn($b) => new BookmarkResource($b)),
            'Daftar bookmark berhasil diambil.'
        );
    }

    public function store(StoreBookmarkRequest $request): JsonResponse
    {
        $userId = $request->user()->id;
        $postId = $request->input('post_id');

        $alreadyBookmarked = Bookmark::where('user_id', $userId)
            ->where('post_id', $postId)
            ->exists();

        if ($alreadyBookmarked) {
            return $this->errorResponse('Post ini sudah ada di bookmark Anda.', null, 422);
        }

        $bookmark = DB::transaction(function () use ($userId, $postId) {
            return Bookmark::create([
                'user_id' => $userId,
                'post_id' => $postId,
            ]);
        });

        return $this->createdResponse(
            new BookmarkResource($bookmark->load('post.user')),
            'Bookmark berhasil ditambahkan.'
        );
    }

    public function destroy(Request $request, Bookmark $bookmark): JsonResponse
    {
        if ($request->user()->id !== $bookmark->user_id) {
            return $this->forbiddenResponse('Anda tidak memiliki akses untuk menghapus bookmark ini.');
        }

        $bookmark->delete();

        return $this->noContentResponse('Bookmark berhasil dihapus.');
    }
}
