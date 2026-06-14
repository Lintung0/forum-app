<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminModeratorSeeder extends Seeder
{
    public function run(): void
    {
        $adminRoleId = DB::table('roles')->where('name', 'admin')->value('id');
        $modRoleId   = DB::table('roles')->where('name', 'moderator')->value('id');

        $adminId = (string) Str::uuid();
        $modId   = (string) Str::uuid();

        DB::table('users')->insert([
            [
                'id'            => $adminId,
                'username'      => 'admin_test',
                'email'         => 'admin@test.com',
                'password_hash' => bcrypt('password123'),
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'id'            => $modId,
                'username'      => 'moderator_test',
                'email'         => 'moderator@test.com',
                'password_hash' => bcrypt('password123'),
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
        ]);

        DB::table('user_roles')->insert([
            ['id' => (string) Str::uuid(), 'user_id' => $adminId, 'role_id' => $adminRoleId, 'assigned_at' => now()],
            ['id' => (string) Str::uuid(), 'user_id' => $modId,   'role_id' => $modRoleId,   'assigned_at' => now()],
        ]);

        $this->command->info('Admin: admin@test.com | Moderator: moderator@test.com | Password: password123');
    }
}
