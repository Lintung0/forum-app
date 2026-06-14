<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'posts';

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'body',
        'status',
        'view_count',
        'vote_score',
        'is_answered',
        'accepted_answer_id',
    ];

    protected function casts(): array
    {
        return [
            'view_count'  => 'integer',
            'vote_score'  => 'integer',
            'is_answered' => 'boolean',
            'created_at'  => 'datetime',
            'updated_at'  => 'datetime',
        ];
    }

    
    
    

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function acceptedAnswer(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'accepted_answer_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'post_tags', 'post_id', 'tag_id')
            ->using(PostTag::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'post_id');
    }

    
    public function topLevelComments(): HasMany
    {
        return $this->hasMany(Comment::class, 'post_id')
            ->whereNull('parent_id')
            ->orderBy('created_at', 'asc');
    }

    public function editHistory(): HasMany
    {
        return $this->hasMany(PostEditHistory::class, 'post_id')
            ->orderByDesc('edited_at');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class, 'target_id')
            ->where('target_type', 'post');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(Like::class, 'target_id')
            ->where('target_type', 'post');
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class, 'post_id');
    }

    
    
    

    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }

    public function isOpen(): bool
    {
        return $this->status === 'open';
    }

    public function isClosed(): bool
    {
        return $this->status === 'closed';
    }

    public function isDeleted(): bool
    {
        return $this->status === 'deleted';
    }

    
    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }
}