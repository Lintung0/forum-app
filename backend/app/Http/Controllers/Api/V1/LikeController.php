<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Like;
use App\Models\Post;
use App\Models\Comment;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LikeController extends Controller
{
    use ApiResponse;

    public function store(Request $request)
    {
        $request->validate([
            'target_id'   => 'required|uuid',
            'target_type' => 'required|in:post,comment',
        ]);

        $user       = $request->user();
        $targetId   = $request->target_id;
        $targetType = $request->target_type;

        return DB::transaction(function () use ($user, $targetId, $targetType) {
            $target = $targetType === 'post'
                ? Post::where('id', $targetId)->lockForUpdate()->first()
                : Comment::where('id', $targetId)->lockForUpdate()->first();

            if (! $target) {
                return $this->notFoundResponse(ucfirst($targetType) . ' tidak ditemukan.');
            }

            $existingLike = Like::where('user_id', $user->id)
                ->where('target_id', $targetId)
                ->where('target_type', $targetType)
                ->lockForUpdate()
                ->first();

            if ($existingLike) {
                $existingLike->delete();
                $isLiked = false;
                $message = "Berhasil unlike {$targetType}.";
            } else {
                Like::create(['user_id' => $user->id, 'target_id' => $targetId, 'target_type' => $targetType]);
                $isLiked = true;
                $message = "Berhasil like {$targetType}.";
            }

            $likesCount = Like::where('target_id', $targetId)->where('target_type', $targetType)->count();

            return $this->successResponse(['liked' => $isLiked, 'likes_count' => $likesCount], $message);
        });
    }

    public function index(Request $request)
    {
        $likes = Like::where('user_id', $request->user()->id)->latest()->paginate(20);

        return $this->paginatedResponse($likes, 'Daftar likes berhasil diambil.');
    }
}
