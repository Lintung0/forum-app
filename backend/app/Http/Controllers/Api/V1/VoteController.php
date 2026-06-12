<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vote\VoteRequest;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Vote;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VoteController extends Controller
{
    use ApiResponse;

    public function store(VoteRequest $request): JsonResponse
    {
        $voter      = $request->user();
        $targetId   = $request->target_id;
        $targetType = $request->target_type;
        $voteType   = $request->vote_type;

        return DB::transaction(function () use ($voter, $targetId, $targetType, $voteType) {
            $target = $targetType === 'post'
                ? Post::where('id', $targetId)->lockForUpdate()->first()
                : Comment::where('id', $targetId)->lockForUpdate()->first();

            if (! $target) {
                return $this->notFoundResponse('Target vote tidak ditemukan.');
            }

            $target->load('user');
            $contentOwner = $target->user;
            $isOwnContent = $contentOwner && ($contentOwner->id === $voter->id);

            // FIX 1: tambah lockForUpdate() untuk mencegah race condition double insert
            $existingVote = Vote::where('user_id', $voter->id)
                ->where('target_id', $targetId)
                ->where('target_type', $targetType)
                ->lockForUpdate()
                ->first();

            $message         = '';
            $notifyNewUpvote = false;

            if (! $existingVote) {
                Vote::create([
                    'user_id'     => $voter->id,
                    'target_id'   => $targetId,
                    'target_type' => $targetType,
                    'vote_type'   => $voteType,
                ]);

                if ($voteType === 'upvote') {
                    $target->increment('vote_score');
                    if (! $isOwnContent && $contentOwner) {
                        $contentOwner->addReputation(10, 'received_upvote', $target->id);
                        $notifyNewUpvote = true;
                    }
                } else {
                    $target->decrement('vote_score');
                    if (! $isOwnContent && $contentOwner) {
                        $contentOwner->deductReputation(5, 'received_downvote', $target->id);
                    }
                }
                $message = 'Vote berhasil disimpan.';

            } elseif ($existingVote->vote_type === $voteType) {
                $existingVote->delete();

                if ($voteType === 'upvote') {
                    $target->decrement('vote_score');
                    if (! $isOwnContent && $contentOwner) {
                        $contentOwner->deductReputation(10, 'upvote_removed', $target->id);
                    }
                } else {
                    $target->increment('vote_score');
                    if (! $isOwnContent && $contentOwner) {
                        $contentOwner->addReputation(5, 'downvote_removed', $target->id);
                    }
                }
                $message = 'Vote berhasil dibatalkan.';

            } else {
                $existingVote->update(['vote_type' => $voteType]);

                if ($voteType === 'upvote') {
                    $target->increment('vote_score', 2);
                    if (! $isOwnContent && $contentOwner) {
                        $contentOwner->addReputation(15, 'vote_changed_to_upvote', $target->id);
                    }
                } else {
                    $target->decrement('vote_score', 2);
                    if (! $isOwnContent && $contentOwner) {
                        $contentOwner->deductReputation(15, 'vote_changed_to_downvote', $target->id);
                    }
                }
                $message = 'Vote berhasil diubah.';
            }

            if ($notifyNewUpvote && $contentOwner) {
                NotificationService::send(
                    $contentOwner->id,
                    $voter->id,
                    'new_upvote',
                    $target->id,
                    $targetType
                );
            }

            // FIX 2: refresh agar vote_score tidak stale
            $target->refresh();

            return $this->successResponse(['vote_score' => $target->vote_score], $message);
        });
    }

    public function destroy(Request $request, Vote $vote): JsonResponse
    {
        if ($request->user()->id !== $vote->user_id) {
            return $this->forbiddenResponse('Anda tidak memiliki akses untuk menghapus vote ini.');
        }

        return DB::transaction(function () use ($vote, $request) {
            $targetModelClass = $vote->target_type === 'post' ? Post::class : Comment::class;
            $target           = $targetModelClass::lockForUpdate()->findOrFail($vote->target_id);

            $target->load('user');
            $contentOwner = $target->user;
            $voter        = $request->user();
            $isOwnContent = $contentOwner && ($contentOwner->id === $voter->id);

            $voteType = $vote->vote_type;

            $vote->delete();

            if ($voteType === 'upvote') {
                $target->decrement('vote_score');
                if (! $isOwnContent && $contentOwner) {
                    $contentOwner->deductReputation(10, 'upvote_removed', $target->id);
                }
            } else {
                $target->increment('vote_score');
                if (! $isOwnContent && $contentOwner) {
                    $contentOwner->addReputation(5, 'downvote_removed', $target->id);
                }
            }

            $target->refresh();

            return $this->successResponse(
                ['vote_score' => $target->vote_score],
                'Vote berhasil dihapus.'
            );
        });
    }
}

