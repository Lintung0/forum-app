<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostEditHistory extends Model
{
    use HasFactory, HasUuids;

    protected $table    = 'post_edit_history';
    public $timestamps  = false;

    protected $fillable = [
        'post_id',
        'edited_by',
        'body_before',
        'body_after',
        'reason',
        'edited_at',
    ];

    protected function casts(): array
    {
        return [
            'edited_at' => 'datetime',
        ];
    }

    // ────────────────────────────────────────────────────────
    // RELATIONSHIPS
    // ────────────────────────────────────────────────────────

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'post_id');
    }

    /** User yang melakukan edit. Nama kolom 'edited_by' bukan 'user_id'. */
    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'edited_by');
    }

    // ────────────────────────────────────────────────────────
    // BOOT
    // ────────────────────────────────────────────────────────

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $model) {
            if (empty($model->edited_at)) {
                $model->edited_at = now();
            }
        });
    }
}