<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use App\Http\Resources\UserResource;

class AdminController extends Controller
{
    use ApiResponse;

    public function listUsers(Request $request)
    {
        $users = User::query()
            ->with('roles')
            ->when($request->filled('q'), function ($q) use ($request) {
                $kw = '%' . $request->input('q') . '%';
                $q->where(function ($query) use ($kw) {
                    $query->where('username', 'like', $kw)
                          ->orWhere('email', 'like', $kw);
                });
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                if ($request->input('status') === 'banned') {
                    $q->where('is_banned', true);
                } else {
                    $q->where('is_banned', false);
                }
            })
            ->orderByDesc('created_at')
            ->paginate(min((int) $request->input('per_page', 20), 50));

        return $this->paginatedResponse(
            $users->through(fn($u) => new UserResource($u)),
            'Daftar user berhasil diambil.'
        );
    }

    public function banUser(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return $this->errorResponse('Anda tidak dapat mem-banned diri sendiri.', null, 422);
        }

        if ($user->isModerator()) {
            return $this->errorResponse('Tidak dapat mem-banned admin atau moderator.', null, 422);
        }

        if ($user->is_banned) {
            return $this->errorResponse('User ini sudah dalam status banned.', null, 422);
        }

        $user->update(['is_banned' => true]);

        return $this->successResponse(
            new UserResource($user),
            'User berhasil di-banned.'
        );
    }

    public function unbanUser(Request $request, User $user)
    {
        if (!$user->is_banned) {
            return $this->errorResponse('User ini tidak dalam status banned.', null, 422);
        }

        $user->update(['is_banned' => false]);

        return $this->successResponse(
            new UserResource($user),
            'User berhasil di-unbanned.'
        );
    }
}