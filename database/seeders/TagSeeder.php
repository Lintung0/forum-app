<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            ['name' => 'PHP',        'color' => '#8892BF'],
            ['name' => 'Laravel',    'color' => '#FF2D20'],
            ['name' => 'JavaScript', 'color' => '#F7DF1E'],
            ['name' => 'Vue.js',     'color' => '#42B883'],
            ['name' => 'React',      'color' => '#61DAFB'],
            ['name' => 'Python',     'color' => '#3572A5'],
            ['name' => 'MySQL',      'color' => '#00618A'],
            ['name' => 'PostgreSQL', 'color' => '#336791'],
            ['name' => 'Docker',     'color' => '#2496ED'],
            ['name' => 'Git',        'color' => '#F05032'],
            ['name' => 'REST API',   'color' => '#009688'],
            ['name' => 'TypeScript', 'color' => '#3178C6'],
        ];

        foreach ($tags as $data) {
            Tag::updateOrCreate(['slug' => Str::slug($data['name'])], $data);
        }

        $this->command->info('✅ Tags seeded.');
    }
}