<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookmarkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'post' => $this->whenLoaded('post', function () {
                return [
                    'id' => $this->post->id,
                    'title' => $this->post->title,
                    'status' => $this->post->status,
                    'vote_score' => $this->post->vote_score,
                    'user' => $this->post->relationLoaded('user') && $this->post->user ? [
                        'id' => $this->post->user->id,
                        'username' => $this->post->user->username,
                    ] : null,
                ];
            }),
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
        ];
    }
}