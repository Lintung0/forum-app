<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     * @param  string  ...$roles  Role yang diizinkan (pisah koma: 'admin,moderator')
     *
     * Contoh pemakaian di route:
     *   Route::middleware(['auth:sanctum', 'role:admin'])
     *   Route::middleware(['auth:sanctum', 'role:admin,moderator'])
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // Pastikan user sudah login
        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Silakan login terlebih dahulu.',
                'data'    => null,
                'errors'  => null,
            ], 401);
        }

        // Cek status banned
        if ($user->is_banned) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda telah dinonaktifkan. Hubungi administrator.',
                'data'    => null,
                'errors'  => null,
            ], 403);
        }

        // Jika tidak ada role yang dispecify, allow semua authenticated user
        if (empty($roles)) {
            return $next($request);
        }

        // Load roles jika belum di-load (eager loading)
        if (! $user->relationLoaded('roles')) {
            $user->load('roles');
        }

        $userRoleNames = $user->roles->pluck('name')->toArray();

        // Cek apakah user memiliki salah satu role yang diperlukan
        foreach ($roles as $role) {
            if (in_array(trim($role), $userRoleNames, true)) {
                return $next($request);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Anda tidak memiliki izin untuk mengakses resource ini.',
            'data'    => null,
            'errors'  => [
                'required_roles' => $roles,
                'your_roles'     => $userRoleNames,
            ],
        ], 403);
    }
}