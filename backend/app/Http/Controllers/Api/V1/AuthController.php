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

    /**
     * Register user baru.
     * POST /api/v1/auth/register
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $user = DB::transaction(function () use ($request) {
                // Buat user baru
                $user = User::create([
                    'username'      => $request->input('username'),
                    'email'         => $request->input('email'),
                    'password_hash' => $request->input('password'),
                ]);

                // Assign role 'user' secara default
                $userRole = Role::where('name', 'user')->first();
                if ($userRole) {
                    $user->roles()->attach($userRole->id, [
                        'assigned_at' => now(),
                    ]);
                }

                return $user;
            });

            // Buat token dengan expiry 30 hari
            $tokenExpiry = now()->addDays((int) config('sanctum.token_expiry', 30));
            $token       = $user->createToken(
                name:           'auth_token',
                abilities:      ['*'],
                expiresAt:      $tokenExpiry
            )->plainTextToken;

            return $this->createdResponse([
                'user'        => new UserResource($user->load('roles')),
                'token'       => $token,
                'token_type'  => 'Bearer',
                'expires_at'  => $tokenExpiry->toISOString(),
            ], 'Registrasi berhasil. Selamat datang di Forum Diskusi!');

        } catch (\Throwable $e) {
            return $this->errorResponse(
                'Registrasi gagal. Silakan coba lagi.',
                app()->environment('production') ? null : $e->getMessage(),
                500
            );
        }
    }

    /**
     * Login user.
     * POST /api/v1/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Cari user berdasarkan email
        $user = User::where('email', $request->input('email'))->first();

        // Verifikasi email & password
        if (! $user || ! Hash::check($request->input('password'), $user->password_hash)) {
            return $this->errorResponse(
                'Email atau password yang Anda masukkan salah.',
                null,
                401
            );
        }

        // Cek status banned
        if ($user->is_banned) {
            return $this->errorResponse(
                'Akun Anda telah dinonaktifkan. Hubungi administrator.',
                null,
                403
            );
        }

        // Hapus token lama jika ingin enforce single session (opsional, uncomment jika perlu)
        // $user->tokens()->where('name', 'auth_token')->delete();

        // Buat token baru
        $tokenExpiry = now()->addDays((int) config('sanctum.token_expiry', 30));
        $token       = $user->createToken(
            name:       'auth_token',
            abilities:  ['*'],
            expiresAt:  $tokenExpiry
        )->plainTextToken;

        return $this->successResponse([
            'user'        => new UserResource($user->load('roles')),
            'token'       => $token,
            'token_type'  => 'Bearer',
            'expires_at'  => $tokenExpiry->toISOString(),
        ], 'Login berhasil. Selamat datang kembali!');
    }

    /**
     * Logout user (revoke current token).
     * POST /api/v1/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        // Hapus token yang sedang digunakan
        $request->user()->currentAccessToken()->delete();

        return $this->noContentResponse('Logout berhasil. Sampai jumpa!');
    }

    /**
     * Logout dari semua device (revoke all tokens).
     * POST /api/v1/auth/logout-all
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return $this->noContentResponse('Berhasil logout dari semua perangkat.');
    }

    /**
     * Ambil data profil user yang sedang login.
     * GET /api/v1/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles');

        return $this->successResponse(
            new UserResource($user),
            'Data profil berhasil diambil.'
        );
    }

    /**
     * Refresh token (revoke lama, buat baru).
     * POST /api/v1/auth/refresh
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();

        // Revoke token saat ini
        $user->currentAccessToken()->delete();

        // Buat token baru
        $tokenExpiry = now()->addDays((int) config('sanctum.token_expiry', 30));
        $token       = $user->createToken(
            name:       'auth_token',
            abilities:  ['*'],
            expiresAt:  $tokenExpiry
        )->plainTextToken;

        return $this->successResponse([
            'token'      => $token,
            'token_type' => 'Bearer',
            'expires_at' => $tokenExpiry->toISOString(),
        ], 'Token berhasil diperbarui.');
    }
}