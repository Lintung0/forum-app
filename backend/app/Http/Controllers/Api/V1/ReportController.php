<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use ApiResponse;

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target_id'   => ['required', 'uuid'],
            'target_type' => ['required', 'in:post,comment,user'],
            'reason'      => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ]);

        // Tidak bisa report diri sendiri
        if ($validated['target_type'] === 'user' && $validated['target_id'] === $request->user()->id) {
            return $this->errorResponse('Tidak bisa melaporkan diri sendiri.', null, 422);
        }

        // Cek duplikat report
        $isDuplicate = Report::where('reporter_id', $request->user()->id)
            ->where('target_id', $validated['target_id'])
            ->where('target_type', $validated['target_type'])
            ->whereIn('status', ['pending', 'reviewed'])
            ->exists();

        if ($isDuplicate) {
            return $this->errorResponse('Anda sudah pernah melaporkan konten ini.', null, 422);
        }

        $report = Report::create([
            'reporter_id' => $request->user()->id,
            'status'      => 'pending',
            'target_id'   => $validated['target_id'],
            'target_type' => $validated['target_type'],
            'reason'      => $validated['reason'],
            'description' => $validated['description'] ?? null,
        ]);

        return $this->createdResponse($report, 'Laporan berhasil dikirim.');
    }

    public function index(Request $request): JsonResponse
    {
        $reports = Report::with('reporter:id,username')
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->latest()
            ->paginate(20);

        return $this->paginatedResponse($reports, 'Daftar laporan berhasil diambil.');
    }

    public function resolve(Request $request, Report $report): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:reviewed,resolved,dismissed'],
        ]);

        $report->update([
            'status'      => $validated['status'],
            'resolved_by' => $request->user()->id,
            'resolved_at' => now(),
        ]);

        return $this->successResponse($report->fresh(), 'Laporan berhasil diperbarui.');
    }
}
