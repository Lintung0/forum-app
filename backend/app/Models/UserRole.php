<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Support\Str;

class UserRole extends Pivot
{
    use HasUuids;

    protected $table = 'user_roles';

    /**
     * Pivot ini punya ID sendiri (UUID) sesuai ERD.
     */
    public $incrementing = false;
    protected $keyType   = 'string';

    /**
     * Tidak ada timestamps standar, hanya assigned_at.
     */
    public $timestamps = false;

    protected $fillable = [
        'id',
        'user_id',
        'role_id',
        'assigned_at',
    ];

    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
        ];
    }

    /**
     * Auto-set assigned_at dan UUID sebelum insert.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $model) {
            if (empty($model->id)) {
                $model->id = Str::uuid()->toString();
            }
            if (empty($model->assigned_at)) {
                $model->assigned_at = now();
            }
        });
    }
}