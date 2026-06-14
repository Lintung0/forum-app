<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'avatar_url' => $this->avatar_url,
            'bio' => $this->bio,
            'reputation_points' => $this->reputation_points,
            'level' => $this->level,
            'is_banned' => (bool) $this->is_banned,
            'posts_count' => $this->posts_count ?? $this->posts()->count(),
            'accepted_answers_count' => $this->comments()->where('is_accepted', true)->count(),
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                    ];
                });
            }),
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
        ];
    }
}