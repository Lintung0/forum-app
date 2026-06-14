<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        
        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Silakan login terlebih dahulu.',
                'data'    => null,
                'errors'  => null,
            ], 401);
        }

        
        if ($user->is_banned) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda telah dinonaktifkan. Hubungi administrator.',
                'data'    => null,
                'errors'  => null,
            ], 403);
        }

        
        if (empty($roles)) {
            return $next($request);
        }

        
        if (! $user->relationLoaded('roles')) {
            $user->load('roles');
        }

        $userRoleNames = $user->roles->pluck('name')->toArray();

        
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