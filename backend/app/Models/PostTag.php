<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Support\Str;

class PostTag extends Pivot
{
    use HasUuids;

    protected $table    = 'post_tags';
    public $incrementing = false;
    protected $keyType  = 'string';
    public $timestamps  = false;

    protected $fillable = ['id', 'post_id', 'tag_id'];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $model) {
            if (empty($model->id)) {
                $model->id = Str::uuid()->toString();
            }
        });
    }

        protected function casts(): array
    {
        return [
            'view_count' => 'integer',
            'vote_score' => 'integer',
            'is_answered' => 'boolean',
        ];
    }
}

