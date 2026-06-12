<?php

use App\Http\Middleware\CheckBanned;
use App\Http\Middleware\CheckRole;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // ─── Stateful API (diperlukan Sanctum) ──────────────────
        // $middleware->statefulApi(); // Dinonaktifkan: menyebabkan 419 CSRF pada request API

        // ─── Custom Middleware Aliases ───────────────────────────
        $middleware->alias([
            'role'            => CheckRole::class,
            'banned'          => CheckBanned::class,
            'throttle'        => ThrottleRequests::class,
            'security.headers' => \App\Http\Middleware\SecurityHeaders::class,
        ]);

        // ─── Append ke semua API route ───────────────────────────
        // Menambahkan header Accept: application/json secara otomatis
        $middleware->appendToGroup('api', [
            \Illuminate\Http\Middleware\HandleCors::class,
            \App\Http\Middleware\SecurityHeaders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        /**
         * Tangani semua exception untuk request API
         * dan pastikan selalu mengembalikan JSON yang seragam.
         */
        $exceptions->render(function (\Throwable $e, Request $request) {
            // Hanya handle jika request ke API endpoint atau expects JSON
            if (! ($request->is('api/*') || $request->expectsJson())) {
                return null; // Biarkan Laravel handle response web biasa
            }

            // ── 422: Validation Error ────────────────────────────
            if ($e instanceof ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data yang diberikan tidak valid.',
                    'data'    => null,
                    'errors'  => $e->errors(),
                ], 422);
            }

            // ── 401: Unauthenticated ─────────────────────────────
            if ($e instanceof AuthenticationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated. Silakan login terlebih dahulu.',
                    'data'    => null,
                    'errors'  => null,
                ], 401);
            }

            // ── 403: Authorization / Forbidden ───────────────────
            if ($e instanceof AuthorizationException) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
                    'data'    => null,
                    'errors'  => null,
                ], 403);
            }

            // ── 404: Model Not Found (route model binding) ───────
            if ($e instanceof ModelNotFoundException) {
                $model = class_basename($e->getModel());
                return response()->json([
                    'success' => false,
                    'message' => "{$model} tidak ditemukan.",
                    'data'    => null,
                    'errors'  => null,
                ], 404);
            }

            // ── 404: Route Not Found ─────────────────────────────
            if ($e instanceof NotFoundHttpException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Endpoint yang diminta tidak ditemukan.',
                    'data'    => null,
                    'errors'  => null,
                ], 404);
            }

            // ── 405: Method Not Allowed ──────────────────────────
            if ($e instanceof MethodNotAllowedHttpException) {
                return response()->json([
                    'success' => false,
                    'message' => 'HTTP method tidak diizinkan untuk endpoint ini.',
                    'data'    => null,
                    'errors'  => null,
                ], 405);
            }

            // ── Generic HTTP Exception ───────────────────────────
            if ($e instanceof HttpException) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'Terjadi kesalahan HTTP.',
                    'data'    => null,
                    'errors'  => null,
                ], $e->getStatusCode());
            }

            // ── 500: Internal Server Error (catch-all) ───────────
            $statusCode = method_exists($e, 'getStatusCode')
                ? $e->getStatusCode()
                : 500;
            $statusCode = ($statusCode >= 400 && $statusCode < 600) ? $statusCode : 500;

            return response()->json([
                'success' => false,
                'message' => app()->environment('production')
                    ? 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
                    : $e->getMessage(),
                'data'    => null,
                'errors'  => app()->environment('production')
                    ? null
                    : [
                        'exception' => get_class($e),
                        'file'      => $e->getFile(),
                        'line'      => $e->getLine(),
                        'trace'     => collect($e->getTrace())->take(5)->toArray(),
                    ],
            ], $statusCode);
        });
    })
    ->create();