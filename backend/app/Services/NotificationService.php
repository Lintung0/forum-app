<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NotificationService
{
    /**
     * Kirim notifikasi ke user tertentu jika pemicunya bukan dirinya sendiri.
     */
    public static function send(string $userId, ?string $actorId, string $type, ?string $referenceId, ?string $referenceType): void
    {
        // Skip jika penerima notifikasi adalah aktor pemicunya sendiri
        if ($userId === $actorId) {
            return;
        }

        DB::table('forum_notifications')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'actor_id' => $actorId,
            'type' => $type,
            'reference_id' => $referenceId,
            'reference_type' => $referenceType,
            'is_read' => false,
            'created_at' => now(),
        ]);
    }
}