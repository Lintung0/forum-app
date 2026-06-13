<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;

class UserController extends Controller
{
    use ApiResponse;

    public function show(User $user)
    {
        $user->loadCount(['followers', 'following', 'posts', 'comments']);

        $recentPosts = $user->posts()
            ->with('category:id,name,slug')
            ->withSum('votes', 'value')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($post) => [
                'id'         => $post->id,
                'title'      => $post->title,
                'slug'       => $post->slug,
                'vote_score' => $post->votes_sum_value ?? 0,
                'created_at' => $post->created_at?->toISOString(),
                'category'   => [
                    'name' => $post->category?->name,
                    'slug' => $post->category?->slug,
                ],
            ]);

        $recentComments = $user->comments()
            ->with('post:id,title')
            ->withSum('votes', 'value')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($comment) => [
                'id'          => $comment->id,
                'post_id'     => $comment->post_id,
                'post_title'  => $comment->post?->title,
                'body'        => $comment->body,
                'vote_score'  => $comment->votes_sum_value ?? 0,
                'is_accepted' => $comment->is_accepted ?? false,
                'created_at'  => $comment->created_at?->toISOString(),
            ]);

        $data = [
            'id'                => $user->id,
            'username'          => $user->username,
            'avatar_url'        => $user->avatar_url,
            'bio'               => $user->bio,
            'reputation_points' => $user->reputation_points,
            'level'             => $user->level,
            'followers_count'   => $user->followers_count,
            'following_count'   => $user->following_count,
            'posts_count'       => $user->posts_count,
            'comments_count'    => $user->comments_count,
            'created_at'        => $user->created_at?->toISOString(),
            'recent_posts'      => $recentPosts,
            'recent_comments'   => $recentComments,
        ];

        return $this->successResponse($data, 'Profil user berhasil diambil.');
    }
}
