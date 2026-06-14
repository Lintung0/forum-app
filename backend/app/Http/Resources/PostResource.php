<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'title'              => $this->title,
            'body'               => $this->body,
            'status'             => $this->status,
            'view_count'  => intval($this->view_count ?? 0),
            'vote_score'  => intval($this->vote_score ?? 0),
            'user_vote'   => $request->user() ? $this->votes()->where('user_id', $request->user()->id)->first()?->vote_type : null,
            'is_bookmarked' => $request->user() ? $this->bookmarks()->where('user_id', $request->user()->id)->exists() : false,
            'bookmark_id'   => $request->user() ? $this->bookmarks()->where('user_id', $request->user()->id)->first()?->id : null,
            'is_answered' => boolval($this->is_answered ?? false),
            'accepted_answer_id' => $this->accepted_answer_id,
            
            'user'               => $this->whenLoaded('user', function () {
                return [
                    'id'                => $this->user->id,
                    'username'          => $this->user->username,
                    'avatar_url'        => $this->user->avatar_url,
                    'reputation_points' => $this->user->reputation_points,
                    'level'             => $this->user->level,
                ];
            }),
            'category'           => $this->whenLoaded('category', function () {
                return new CategoryResource($this->category);
            }),
            'tags'               => $this->whenLoaded('tags', function () {
                return TagResource::collection($this->tags);
            }),
            'accepted_answer'    => $this->whenLoaded('acceptedAnswer', function () {
                return new CommentResource($this->acceptedAnswer);
            }),
            'comments'           => $this->whenLoaded('topLevelComments', function () {
                return CommentResource::collection($this->topLevelComments);
            }),
            'comments_count'     => $this->whenCounted('comments'),
            'edit_history'       => $this->whenLoaded('editHistory', function () {
                return PostEditHistoryResource::collection($this->editHistory);
            }),
            'created_at'         => $this->created_at->toISOString(),
            'updated_at'         => $this->updated_at->toISOString(),
        ];
    }
}