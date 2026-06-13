<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    use ApiResponse;

    public function banUser(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return $this->errorResponse('Anda tidak dapat mem-banned diri sendiri.', null, 422);
        }

        if ($user->is_banned) {
            return $this->errorResponse('User ini sudah dalam status banned.', null, 422);
        }

        $user->update(['is_banned' => true]);

        return $this->successResponse(new UserResource($user), 'User berhasil di-banned.');
    }

    public function unbanUser(Request $request, User $user)
    {
        if (! $user->is_banned) {
            return $this->errorResponse('User ini tidak dalam status banned.', null, 422);
        }

        $user->update(['is_banned' => false]);

        return $this->successResponse(new UserResource($user), 'User berhasil di-unbanned.');
    }
}
