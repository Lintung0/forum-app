<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    protected $table = 'users';

    public function getRouteKeyName(): string
    {
        return 'username';
    }

    /**
     * Kolom yang boleh diisi secara mass assignment.
     */
    protected $fillable = [
        'username',
        'email',
        'password_hash',
        'avatar_url',
        'bio',
        'reputation_points',
        'level',
        'is_banned',
    ];

    /**
     * Kolom yang disembunyikan dari JSON response.
     */
    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    protected $attributes = [
    'reputation_points' => 0,
    'level'             => 1,
    'is_banned'         => false,
    ];


    /**
     * Type casting kolom.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_banned'         => 'boolean',
            'reputation_points' => 'integer',
            'level'             => 'integer',
        ];
    }

    /**
     * Override nama kolom password untuk Laravel Auth.
     * Penting agar Sanctum & Hash::check() berjalan benar.
     */
    public function getAuthPasswordName(): string
    {
        return 'password_hash';
    }

    /**
     * Auto-hash password saat di-set.
     */
    public function setPasswordHashAttribute(string $value): void
    {
        // Hindari double-hashing jika sudah berupa bcrypt string
        if (! str_starts_with($value, '$2y$') && ! str_starts_with($value, '$argon')) {
            $this->attributes['password_hash'] = bcrypt($value);
        } else {
            $this->attributes['password_hash'] = $value;
        }
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id')
            ->using(UserRole::class)
            ->withPivot('assigned_at');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'user_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'user_id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class, 'user_id');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(Like::class, 'user_id');
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class, 'user_id');
    }

    public function followers(): HasMany
    {
        return $this->hasMany(Follow::class, 'following_id');
    }

    public function following(): HasMany
    {
        return $this->hasMany(Follow::class, 'follower_id');
    }

    public function pointsLog(): HasMany
    {
        return $this->hasMany(PointsLog::class, 'user_id');
    }

    public function forumNotifications(): HasMany
    {
        return $this->hasMany(ForumNotification::class, 'user_id');
    }
    public function reports(): HasMany
    {
       return $this->hasMany(Report::class, 'reporter_id');
    }

    public function hasRole(string $roleName): bool
    {
        if ($this->relationLoaded('roles')) {
            return $this->roles->contains('name', $roleName);
        }
        return $this->roles()->where('name', $roleName)->exists();
    }

    /**
     * Cek apakah user memiliki salah satu dari beberapa role.
     */
    public function hasAnyRole(array $roles): bool
    {
        if ($this->relationLoaded('roles')) {
            return $this->roles->whereIn('name', $roles)->isNotEmpty();
        }
        return $this->roles()->whereIn('name', $roles)->exists();
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isModerator(): bool
    {
        return $this->hasAnyRole(['admin', 'moderator']);
    }

    public function addReputation(int $points, string $actionType, ?string $referenceId = null): void
    {
        $this->increment('reputation_points', $points);
        PointsLog::create([
            'user_id'      => $this->id,
            'points'       => $points,
            'action_type'  => $actionType,
            'reference_id' => $referenceId,
        ]);
        $this->updateLevel();
    }

    public function deductReputation(int $points, string $actionType, ?string $referenceId = null): void
    {
        $newPoints = max(0, $this->reputation_points - $points);
        $this->update(['reputation_points' => $newPoints]);
        PointsLog::create([
            'user_id'      => $this->id,
            'points'       => -$points,
            'action_type'  => $actionType,
            'reference_id' => $referenceId,
        ]);
        $this->updateLevel();
    }

    private function updateLevel(): void
    {
        $thresholds = [
            1  => 0,    2  => 100,  3  => 300,
            4  => 600,  5  => 1000, 6  => 2000,
            7  => 4000, 8  => 7000, 9  => 11000,
            10 => 15000,
        ];

        $level = 1;
        foreach ($thresholds as $lvl => $threshold) {
            if ($this->reputation_points >= $threshold) {
                $level = $lvl;
            }
        }

        if ($this->level !== $level) {
            $this->update(['level' => $level]);
        }
    }
}