<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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
                ['username' => 'admin'],
                [
                    'email'             => 'admin@gmail.com',
                    'password_hash'     => Hash::make('secret123'),
                    'bio'               => 'Administrator Forum Diskusi. Kontak saya untuk pertanyaan teknis.',
                    'reputation_points' => 9999,
                    'level'             => 10,
                    'is_banned'         => false,
                    'email_verified_at' => now(),
                    'username'          => 'admin',
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
                ['username' => 'moderator'],
                [
                    'email'             => 'mod@gmail.com',
                    'password_hash'     => Hash::make('secret123'),
                    'bio'               => 'Moderator Forum Diskusi.',
                    'reputation_points' => 1500,
                    'level'             => 5,
                    'is_banned'         => false,
                    'email_verified_at' => now(),
                    'username'          => 'moderator',
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
                ['admin@gmail.com', 'admin',      'secret123', 'admin, user'],
                ['mod@gmail.com',   'moderator',  'secret123',   'moderator, user'],
                ['user@forum.test',  'sampleuser', 'User@12345',  'user'],
            ]
        );
    }
}