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
        $user->load('roles');
        $user->loadCount(['followers', 'following', 'posts']);

        $role = 'user';
        if ($user->roles->contains('name', 'admin')) {
            $role = 'admin';
        } elseif ($user->roles->contains('name', 'moderator')) {
            $role = 'moderator';
        }

        $data = [
            'id' => $user->id,
            'username' => $user->username,
            'avatar_url' => $user->avatar_url,
            'bio' => $user->bio,
            'reputation_points' => $user->reputation_points,
            'level' => $user->level,
            'role' => $role,
            'followers_count' => $user->followers_count,
            'following_count' => $user->following_count,
            'posts_count' => $user->posts_count,
            'created_at' => $user->created_at ? $user->created_at->toISOString() : null,
        ];

        return $this->successResponse($data, 'Profil user berhasil diambil.');
    }
}