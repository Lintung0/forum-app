<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;

    public function show(User $user)
    {
        // Hitung jumlah followers, following, dan post milik user
        $user->loadCount(['followers', 'following', 'posts']);

        $data = [
            'id' => $user->id,
            'username' => $user->username,
            'avatar_url' => $user->avatar_url,
            'bio' => $user->bio,
            'reputation_points' => $user->reputation_points,
            'level' => $user->level,
            'followers_count' => $user->followers_count,
            'following_count' => $user->following_count,
            'posts_count' => $user->posts_count,
            'created_at' => $user->created_at ? $user->created_at->toISOString() : null,
        ];

        return $this->successResponse($data, 'Profil user berhasil diambil.');
    }
}