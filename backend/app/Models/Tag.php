<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Tag extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'tags';

    
    public $timestamps = false;

    protected $fillable = [
        'name',
        'slug',
        'color',
        'usage_count',
    ];

    protected $attributes = [
    'usage_count' => 0,
    ];


    protected function casts(): array
    {
        return [
            'created_at'  => 'datetime',
            'usage_count' => 'integer',
        ];
    }

    
    
    

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_tags', 'tag_id', 'post_id')
            ->using(PostTag::class);
    }

    
    
    

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $model) {
            if (empty($model->created_at)) {
                $model->created_at = now();
            }
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name);
            }
        });
    }
}