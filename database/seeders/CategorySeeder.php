<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Programming',       'slug' => 'programming',       'description' => 'Diskusi seputar pemrograman dan software development.'],
            ['name' => 'Web Development',   'slug' => 'web-development',   'description' => 'Frontend, backend, dan full-stack web development.'],
            ['name' => 'Database',          'slug' => 'database',          'description' => 'SQL, NoSQL, optimasi query, dan desain database.'],
            ['name' => 'DevOps',            'slug' => 'devops',            'description' => 'CI/CD, Docker, Kubernetes, dan infrastruktur.'],
            ['name' => 'Mobile Development','slug' => 'mobile-development','description' => 'Android, iOS, Flutter, React Native.'],
            ['name' => 'AI & Machine Learning','slug' => 'ai-machine-learning','description' => 'Kecerdasan buatan, ML, dan data science.'],
            ['name' => 'General',           'slug' => 'general',           'description' => 'Diskusi umum seputar teknologi.'],
        ];

        foreach ($categories as $data) {
            Category::updateOrCreate(['slug' => $data['slug']], $data);
        }

        $this->command->info('✅ Categories seeded.');
    }
}