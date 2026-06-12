<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name'        => 'admin',
                'permissions' => [
                    'users.view',
                    'users.manage',
                    'users.ban',
                    'posts.view',
                    'posts.manage',
                    'posts.delete_any',
                    'comments.view',
                    'comments.manage',
                    'comments.delete_any',
                    'categories.create',
                    'categories.edit',
                    'categories.delete',
                    'tags.create',
                    'tags.edit',
                    'tags.delete',
                    'reports.view',
                    'reports.manage',
                    'roles.manage',
                    'dashboard.access',
                ],
            ],
            [
                'name'        => 'moderator',
                'permissions' => [
                    'users.view',
                    'users.ban',
                    'posts.view',
                    'posts.close',
                    'posts.delete_any',
                    'comments.view',
                    'comments.delete_any',
                    'reports.view',
                    'reports.manage',
                    'dashboard.access',
                ],
            ],
            [
                'name'        => 'user',
                'permissions' => [
                    'posts.create',
                    'posts.edit_own',
                    'posts.delete_own',
                    'comments.create',
                    'comments.edit_own',
                    'comments.delete_own',
                    'votes.create',
                    'votes.delete_own',
                    'likes.create',
                    'likes.delete_own',
                    'bookmarks.create',
                    'bookmarks.delete_own',
                    'follows.create',
                    'follows.delete_own',
                ],
            ],
        ];

        foreach ($roles as $roleData) {
            Role::updateOrCreate(
                ['name' => $roleData['name']],
                $roleData
            );
        }

        $this->command->info('✅ Roles seeded: admin, moderator, user');
    }
}