<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TagResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'color'       => $this->color,
            'usage_count' => $this->usage_count,
            'posts_count' => $this->posts_count,
            'created_at'  => $this->created_at?->toISOString(),
        ];
    }
}