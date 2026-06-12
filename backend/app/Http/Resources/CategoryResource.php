<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'description' => $this->description,
            'parent_id'   => $this->parent_id,
            'parent'      => $this->whenLoaded('parent', function () {
                return [
                    'id'   => $this->parent->id,
                    'name' => $this->parent->name,
                    'slug' => $this->parent->slug,
                ];
            }),
            'children'    => $this->whenLoaded('children', function () {
                return $this->children->map(fn($child) => [
                    'id'   => $child->id,
                    'name' => $child->name,
                    'slug' => $child->slug,
                ]);
            }),
            'posts_count' => $this->whenCounted('posts'),
            'created_at'  => $this->created_at?->toISOString(),
        ];
    }
}