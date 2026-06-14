<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'comments';

    protected $fillable = [
        'post_id',
        'user_id',
        'parent_id',
        'body',
        'vote_score',
        'is_accepted',
    ];

    protected function casts(): array
    {
        return [
            'vote_score'  => 'integer',
            'is_accepted' => 'boolean',
            'created_at'  => 'datetime',
            'updated_at'  => 'datetime',
        ];
    }

    
    
    

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'post_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    
    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id')
            ->orderBy('created_at', 'asc');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class, 'target_id')
            ->where('target_type', 'comment');
    }

    public function editHistory(): HasMany
    {
        return $this->hasMany(CommentEditHistory::class, 'comment_id')
            ->orderByDesc('edited_at');
    }
    
    
    

    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }

    public function isTopLevel(): bool
    {
        return $this->parent_id === null;
    }

    public function isReply(): bool
    {
        return $this->parent_id !== null;
    }
}