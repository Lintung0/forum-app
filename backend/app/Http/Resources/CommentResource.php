<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'post_id'       => $this->post_id,
            'parent_id'     => $this->parent_id,
            'body'          => $this->body,
            'vote_score'    => $this->vote_score,
            'is_accepted'   => $this->is_accepted,
            'is_deleted'    => (bool) ($this->is_deleted ?? false),
            'user'          => $this->whenLoaded('user', function () {
                return [
                    'id'         => $this->user->id,
                    'username'   => $this->user->username,
                    'avatar_url' => $this->user->avatar_url,
                    'level'      => $this->user->level,
                ];
            }),
            // Replies 1 level nested
            'replies'       => $this->whenLoaded('replies', function () {
                return CommentResource::collection($this->replies);
            }),
            'replies_count' => $this->whenCounted('replies'),
            'edit_history'  => $this->whenLoaded('editHistory', function () {
                return CommentEditHistoryResource::collection($this->editHistory);
            }),
            'created_at'    => $this->created_at->toISOString(),
            'updated_at'    => $this->updated_at->toISOString(),
        ];
    }
}