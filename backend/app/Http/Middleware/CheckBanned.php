<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBanned
{
    /**
     * Middleware ini memblokir user yang statusnya banned.
     * Gunakan bersama 'auth:sanctum' untuk semua protected routes.
     *
     * Contoh: Route::middleware(['auth:sanctum', 'banned'])
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->is_banned) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda telah dinonaktifkan. Hubungi administrator untuk informasi lebih lanjut.',
                'data'    => null,
                'errors'  => null,
            ], 403);
        }

        return $next($request);
    }
}