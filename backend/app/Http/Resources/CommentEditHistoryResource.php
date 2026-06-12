<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentEditHistoryResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'comment_id'  => $this->comment_id,
            'edited_by'   => $this->whenLoaded('editor', function () {
                return [
                    'id'       => $this->editor->id,
                    'username' => $this->editor->username,
                ];
            }, $this->edited_by),
            'body_before' => $this->body_before,
            'body_after'  => $this->body_after,
            'edited_at'   => $this->edited_at->toISOString(),
        ];
    }
}