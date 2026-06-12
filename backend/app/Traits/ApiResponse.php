<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

trait ApiResponse
{
    /**
     * Response sukses standar (200).
     */
    protected function successResponse(
        mixed $data,
        string $message = 'Berhasil.',
        int $statusCode = 200
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
            'errors'  => null,
        ], $statusCode);
    }

    /**
     * Response sukses untuk data yang baru dibuat (201).
     */
    protected function createdResponse(
        mixed $data,
        string $message = 'Data berhasil dibuat.'
    ): JsonResponse {
        return $this->successResponse($data, $message, 201);
    }

    /**
     * Response sukses tanpa data (operasi delete, dll).
     */
    protected function noContentResponse(
        string $message = 'Operasi berhasil dilakukan.'
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => null,
            'errors'  => null,
        ], 200);
    }

    /**
     * Response error generik.
     */
    protected function errorResponse(
        string $message = 'Terjadi kesalahan.',
        mixed $errors = null,
        int $statusCode = 400
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data'    => null,
            'errors'  => $errors,
        ], $statusCode);
    }

    /**
     * Response 404 Not Found.
     */
    protected function notFoundResponse(
        string $message = 'Data tidak ditemukan.'
    ): JsonResponse {
        return $this->errorResponse($message, null, 404);
    }

    /**
     * Response 401 Unauthenticated.
     */
    protected function unauthorizedResponse(
        string $message = 'Unauthenticated. Silakan login.'
    ): JsonResponse {
        return $this->errorResponse($message, null, 401);
    }

    /**
     * Response 403 Forbidden.
     */
    protected function forbiddenResponse(
        string $message = 'Anda tidak memiliki akses ke resource ini.'
    ): JsonResponse {
        return $this->errorResponse($message, null, 403);
    }

    /**
     * Response untuk data paginasi.
     * Menjaga format JSON yang seragam dengan meta & links.
     */
    protected function paginatedResponse(
        LengthAwarePaginator $paginator,
        string $message = 'Berhasil.',
        mixed $additionalData = null
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
            'data'    => $paginator->items(),
            'errors'  => null,
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
            ],
            'links'   => [
                'first' => $paginator->url(1),
                'last'  => $paginator->url($paginator->lastPage()),
                'prev'  => $paginator->previousPageUrl(),
                'next'  => $paginator->nextPageUrl(),
            ],
        ];

        if ($additionalData !== null) {
            $response['additional'] = $additionalData;
        }

        return response()->json($response, 200);
    }
}