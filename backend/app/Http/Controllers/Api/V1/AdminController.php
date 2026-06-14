<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use App\Traits\ApiResponse;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
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

    public function index(Request $request)
    {
        $query = User::with('roles')->latest();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate($request->input('limit', 10));

        return $this->successResponse(UserResource::collection($users));
    }

    public function dashboardStats(): JsonResponse
    {
        $totalUsers = User::count();
        $totalPosts = Post::count();
        $totalComments = Comment::count();
        $pendingReports = Report::where('status', 'pending')->count();

        return $this->successResponse([
            'total_users' => $totalUsers,
            'total_posts' => $totalPosts,
            'total_comments' => $totalComments,
            'pending_reports' => $pendingReports,
        ], 'Dashboard stats retrieved successfully.');
    }
}
