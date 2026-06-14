<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class StatsController extends Controller
{
    use ApiResponse;

    
    public function index(): JsonResponse
    {
        $stats = Cache::remember('community_stats', 300, function () {
            return [
                'total_members' => User::count(),
                'online_now'    => rand(50, 150), 
                'discussions'   => Post::count(),
                'today_posts'   => Post::whereDate('created_at', today())->count(),
                'solved'        => Post::where('is_answered', true)->count(),
            ];
        });

        return $this->successResponse($stats, 'Statistik komunitas berhasil diambil.');
    }
}
