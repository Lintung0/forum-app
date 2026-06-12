<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ForumNotification;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $notifications = ForumNotification::where('user_id', $request->user()->id)
            ->with('actor:id,username,avatar_url')
            ->latest()
            ->paginate(20);

        return $this->paginatedResponse($notifications, 'Notifikasi berhasil diambil.');
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = ForumNotification::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $notification) {
            return $this->notFoundResponse('Notifikasi tidak ditemukan.');
        }

        $notification->update(['is_read' => true]);

        return $this->successResponse($notification, 'Notifikasi ditandai sudah dibaca.');
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $count = ForumNotification::where([
            'user_id' => $request->user()->id,
            'is_read' => false,
        ])->update(['is_read' => true]);

        return $this->successResponse(['updated_count' => $count], 'Semua notifikasi ditandai sudah dibaca.');
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = ForumNotification::where([
            'user_id' => $request->user()->id,
            'is_read' => false,
        ])->count();

        return $this->successResponse(['unread_count' => $count], 'Jumlah notifikasi belum dibaca.');
    }
}
