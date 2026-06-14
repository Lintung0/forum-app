<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $actorName = $this->actor ? $this->actor->username : 'System';
        $type = $this->type;
        
        $actionText = match($type) {
            'new_comment' => 'commented on your post',
            'new_reply'   => 'replied to your comment',
            'new_upvote'  => 'upvoted your content',
            'accepted_answer' => 'marked your comment as the solution',
            'new_follower' => 'started following you',
            default => 'sent you a message'
        };

        
        $targetTitle = 'Content';
        if ($this->reference) {
            if ($this->reference_type === 'post') {
                $targetTitle = $this->reference->title ?? 'a post';
            } elseif ($this->reference_type === 'comment') {
                $targetTitle = $this->reference->body ?? 'a comment';
            }
        }

        if (strlen($targetTitle) > 30) {
            $targetTitle = substr($targetTitle, 0, 27) . '...';
        }

        $timeAgo = 'Recently';
        if ($this->created_at) {
            try {
                $timeAgo = Carbon::parse($this->created_at)->diffForHumans();
            } catch (\Exception $e) {
                $timeAgo = 'Recently';
            }
        }

        return [
            'id'          => $this->id,
            'type'        => $this->mapTypeToCategory($type),
            'user'        => $actorName,
            'actor_avatar'=> $this->actor?->avatar_url,
            'actionText'  => $actionText,
            'targetTitle' => $targetTitle,
            'timeAgo'     => $timeAgo,
            'isRead'      => (bool) $this->is_read,
        ];
    }

    private function mapTypeToCategory(string $type): string
    {
        return match($type) {
            'new_comment', 'new_reply' => 'balasan',
            'new_upvote' => 'suka',
            'new_follower' => 'pengikut',
            'accepted_answer' => 'solusi',
            default => 'sistem'
        };
    }
}
