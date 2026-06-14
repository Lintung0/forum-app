<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use App\Models\Post;
use App\Models\Comment;
use App\Models\User;

class Report extends Model
{
    use HasUuids;

    protected $table = 'reports';

    const UPDATED_AT = null;

    protected $fillable = [
        'reporter_id',
        'target_id',
        'target_type',
        'reason',
        'description',
        'status',
        'resolved_by',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
        ];
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    
    public function getContentPreviewAttribute(): ?string
    {
        if ($this->target_type === 'post') {
            $post = Post::find($this->target_id);
            return $post ? Str::limit(strip_tags($post->body), 100) : null;
        } elseif ($this->target_type === 'comment') {
            $comment = Comment::find($this->target_id);
            return $comment ? Str::limit(strip_tags($comment->body), 100) : null;
        } elseif ($this->target_type === 'user') {
            $user = User::find($this->target_id);
            return $user ? Str::limit($user->bio ?? $user->username, 100) : null;
        }

        return null;
    }

    
    public function getReportedTypeAttribute(): string
    {
        return Str::headline($this->target_type);
    }
}