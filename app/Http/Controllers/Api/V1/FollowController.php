<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Follow;
use App\Models\User;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    use ApiResponse;

    public function follow(Request $request, User $user): JsonResponse
    {
        if ($request->user()->id === $user->id) {
            return $this->errorResponse('Tidak bisa follow diri sendiri.', null, 422);
        }

        $alreadyFollowing = Follow::where([
            'follower_id'  => $request->user()->id,
            'following_id' => $user->id,
        ])->exists();

        if ($alreadyFollowing) {
            return $this->errorResponse('Sudah follow user ini.', null, 422);
        }

        $follow = Follow::create([
            'follower_id'  => $request->user()->id,
            'following_id' => $user->id,
        ]);

        NotificationService::send(
            $user->id,
            $request->user()->id,
            'new_follower',
            $request->user()->id,
            null
        );

        return $this->successResponse([
            'id'         => $follow->id,
            'following'  => [
                'id'       => $user->id,
                'username' => $user->username,
            ],
            'created_at' => $follow->created_at->toISOString(),
        ], 'Berhasil follow user.', 201);
    }

    public function unfollow(Request $request, User $user): JsonResponse
    {
        $follow = Follow::where([
            'follower_id'  => $request->user()->id,
            'following_id' => $user->id,
        ])->first();

        if (! $follow) {
            return $this->errorResponse('Anda belum follow user ini.', null, 404);
        }

        $follow->delete();

        return $this->successResponse(null, 'Berhasil unfollow user.');
    }

    public function followers(Request $request, User $user): JsonResponse
    {
        $followers = Follow::where('following_id', $user->id)
            ->with('follower:id,username,avatar_url,reputation_points,level')
            ->paginate(20);

        return $this->paginatedResponse($followers, 'Daftar followers berhasil diambil.');
    }

    public function following(Request $request, User $user): JsonResponse
    {
        $following = Follow::where('follower_id', $user->id)
            ->with('following:id,username,avatar_url,reputation_points,level')
            ->paginate(20);

        return $this->paginatedResponse($following, 'Daftar following berhasil diambil.');
    }
}
