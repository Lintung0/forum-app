<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'categories';

    
    public $timestamps = false;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'parent_id',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    
    
    

    
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'category_id');
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