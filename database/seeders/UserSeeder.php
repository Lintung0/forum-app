<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $adminRole = Role::where('name', 'admin')->firstOrFail();
            $modRole   = Role::where('name', 'moderator')->firstOrFail();
            $userRole  = Role::where('name', 'user')->firstOrFail();

            // ── Admin User ──────────────────────────────────────
            $admin = User::updateOrCreate(
                ['email' => 'admin@forum.test'],
                [
                    'username'          => 'admin',
                    'email'             => 'admin@forum.test',
                    'password_hash'     => 'Admin@12345',
                    'bio'               => 'Administrator Forum Diskusi. Kontak saya untuk pertanyaan teknis.',
                    'reputation_points' => 9999,
                    'level'             => 10,
                    'is_banned'         => false,
                    'email_verified_at' => now(),
                ]
            );

            // Assign admin & user role
            $existingAdminRoles = $admin->roles()->pluck('roles.id')->toArray();
            if (! in_array($adminRole->id, $existingAdminRoles)) {
                $admin->roles()->attach($adminRole->id, ['assigned_at' => now()]);
            }
            if (! in_array($userRole->id, $existingAdminRoles)) {
                $admin->roles()->attach($userRole->id, ['assigned_at' => now()]);
            }

            // ── Moderator User ──────────────────────────────────
            $moderator = User::updateOrCreate(
                ['email' => 'mod@forum.test'],
                [
                    'username'          => 'moderator',
                    'email'             => 'mod@forum.test',
                    'password_hash'     => 'Mod@12345',
                    'bio'               => 'Moderator Forum Diskusi.',
                    'reputation_points' => 1500,
                    'level'             => 5,
                    'is_banned'         => false,
                    'email_verified_at' => now(),
                ]
            );

            $existingModRoles = $moderator->roles()->pluck('roles.id')->toArray();
            if (! in_array($modRole->id, $existingModRoles)) {
                $moderator->roles()->attach($modRole->id, ['assigned_at' => now()]);
            }
            if (! in_array($userRole->id, $existingModRoles)) {
                $moderator->roles()->attach($userRole->id, ['assigned_at' => now()]);
            }

            // ── Sample Regular User ─────────────────────────────
            $sampleUser = User::updateOrCreate(
                ['email' => 'user@forum.test'],
                [
                    'username'          => 'sampleuser',
                    'email'             => 'user@forum.test',
                    'password_hash'     => 'User@12345',
                    'bio'               => 'User biasa yang suka berdiskusi.',
                    'reputation_points' => 50,
                    'level'             => 1,
                    'is_banned'         => false,
                    'email_verified_at' => now(),
                ]
            );

            $existingUserRoles = $sampleUser->roles()->pluck('roles.id')->toArray();
            if (! in_array($userRole->id, $existingUserRoles)) {
                $sampleUser->roles()->attach($userRole->id, ['assigned_at' => now()]);
            }
        });

        $this->command->info('✅ Users seeded:');
        $this->command->table(
            ['Email', 'Username', 'Password', 'Role'],
            [
                ['admin@forum.test', 'admin',      'Admin@12345', 'admin, user'],
                ['mod@forum.test',   'moderator',  'Mod@12345',   'moderator, user'],
                ['user@forum.test',  'sampleuser', 'User@12345',  'user'],
            ]
        );
    }
}