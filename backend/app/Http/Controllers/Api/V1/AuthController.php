<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $user = DB::transaction(function () use ($request) {
                $user = User::create([
                    'username'      => $request->input('username'),
                    'email'         => $request->input('email'),
                    'password_hash' => $request->input('password'),
                ]);

                $userRole = Role::where('name', 'user')->first();
                if ($userRole) {
                    $user->roles()->attach($userRole->id, ['assigned_at' => now()]);
                }

                return $user;
            });

            $tokenExpiry = now()->addDays((int) config('sanctum.token_expiry', 30));
            $token       = $user->createToken('auth_token', ['*'], $tokenExpiry)->plainTextToken;

            return $this->createdResponse([
                'user'       => new UserResource($user->load('roles')),
                'token'      => $token,
                'token_type' => 'Bearer',
                'expires_at' => $tokenExpiry->toISOString(),
            ], 'Registrasi berhasil. Selamat datang di Forum Diskusi!');

        } catch (\Throwable $e) {
            return $this->errorResponse(
                'Registrasi gagal. Silakan coba lagi.',
                app()->environment('production') ? null : $e->getMessage(),
                500
            );
        }
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->input('email'))->first();

        if (! $user || ! Hash::check($request->input('password'), $user->password_hash)) {
            return $this->errorResponse('Email atau password yang Anda masukkan salah.', null, 401);
        }

        if ($user->is_banned) {
            return $this->errorResponse('Akun Anda telah dinonaktifkan. Hubungi administrator.', null, 403);
        }

        $tokenExpiry = now()->addDays((int) config('sanctum.token_expiry', 30));
        $token       = $user->createToken('auth_token', ['*'], $tokenExpiry)->plainTextToken;

        return $this->successResponse([
            'user'       => new UserResource($user->load('roles')),
            'token'      => $token,
            'token_type' => 'Bearer',
            'expires_at' => $tokenExpiry->toISOString(),
        ], 'Login berhasil. Selamat datang kembali!');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->noContentResponse('Logout berhasil. Sampai jumpa!');
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return $this->noContentResponse('Berhasil logout dari semua perangkat.');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->successResponse(
            new UserResource($request->user()->load('roles')),
            'Data profil berhasil diambil.'
        );
    }

    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();

        $tokenExpiry = now()->addDays((int) config('sanctum.token_expiry', 30));
        $token       = $user->createToken('auth_token', ['*'], $tokenExpiry)->plainTextToken;

        return $this->successResponse([
            'token'      => $token,
            'token_type' => 'Bearer',
            'expires_at' => $tokenExpiry->toISOString(),
        ], 'Token berhasil diperbarui.');
    }
}
