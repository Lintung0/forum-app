<?php

namespace Database\Seeders;

use App\Models\Bookmark;
use App\Models\Category;
use App\Models\Comment;
use App\Models\Follow;
use App\Models\Like;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PostCommentSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $admin = User::where('email', 'admin@forum.test')->firstOrFail();
            $mod   = User::where('email', 'mod@forum.test')->firstOrFail();
            $user  = User::where('email', 'user@forum.test')->firstOrFail();

            $catWeb  = Category::where('slug', 'web-development')->firstOrFail();
            $catDb   = Category::where('slug', 'database')->firstOrFail();
            $catDev  = Category::where('slug', 'devops')->firstOrFail();
            $catProg = Category::where('slug', 'programming')->firstOrFail();

            $tagLaravel = Tag::where('slug', 'laravel')->firstOrFail();
            $tagPHP     = Tag::where('slug', 'php')->firstOrFail();
            $tagVue     = Tag::where('slug', 'vue-js')->firstOrFail();
            $tagMySQL   = Tag::where('slug', 'mysql')->firstOrFail();
            $tagDocker  = Tag::where('slug', 'docker')->firstOrFail();
            $tagAPI     = Tag::where('slug', 'rest-api')->firstOrFail();

            // ── Post 1 ───────────────────────────────────────────
            $post1 = Post::create([
                'user_id'     => $user->id,
                'category_id' => $catWeb->id,
                'title'       => 'Bagaimana cara setup Laravel Sanctum untuk SPA?',
                'body'        => "Halo semua,\n\nSaya sedang membangun SPA menggunakan Vue.js + Laravel. Ingin pakai Sanctum untuk autentikasi.\n\nBagaimana langkah setup yang benar? Terutama soal CORS dan cookie-based auth.",
                'status'      => 'open',
                'vote_score'  => 5,
                'view_count'  => 120,
            ]);
            $post1->tags()->attach([$tagLaravel->id, $tagPHP->id, $tagVue->id]);

            $comment1a = Comment::create([
                'post_id'     => $post1->id,
                'user_id'     => $admin->id,
                'body'        => "Langkah setup Sanctum untuk SPA:\n\n1. `composer require laravel/sanctum`\n2. Publish config\n3. Tambah middleware `EnsureFrontendRequestsAreStateful` di api group\n4. Set `SANCTUM_STATEFUL_DOMAINS` sesuai domain frontend\n5. Set `supports_credentials: true` di `config/cors.php`\n6. Hit `/sanctum/csrf-cookie` sebelum login",
                'vote_score'  => 8,
                'is_accepted' => true,
            ]);

            Comment::create([
                'post_id'    => $post1->id,
                'user_id'    => $mod->id,
                'parent_id'  => $comment1a->id,
                'body'       => 'Tambahan: pastikan frontend dan backend di domain yang sama agar cookie SameSite bekerja.',
                'vote_score' => 3,
            ]);

            Comment::create([
                'post_id'    => $post1->id,
                'user_id'    => $user->id,
                'body'       => 'Berhasil! Masalahnya memang di `supports_credentials` yang belum true. Terima kasih!',
                'vote_score' => 1,
            ]);

            $post1->update(['is_answered' => true, 'accepted_answer_id' => $comment1a->id]);

            // ── Post 2 ───────────────────────────────────────────
            $post2 = Post::create([
                'user_id'     => $mod->id,
                'category_id' => $catDb->id,
                'title'       => 'Optimasi query MySQL lambat dengan jutaan data',
                'body'        => "Tabel `transactions` dengan ~5 juta baris. Query ini lambat (>10 detik):\n\n```sql\nSELECT * FROM transactions WHERE user_id = 123 AND status = 'pending' ORDER BY created_at DESC;\n```\n\nSudah ada index di `user_id` tapi tetap lambat. Ada saran?",
                'status'      => 'open',
                'vote_score'  => 12,
                'view_count'  => 340,
            ]);
            $post2->tags()->attach([$tagMySQL->id]);

            $comment2a = Comment::create([
                'post_id'     => $post2->id,
                'user_id'     => $admin->id,
                'body'        => "Buat composite index yang cover ketiga kolom:\n\n```sql\nALTER TABLE transactions ADD INDEX idx_user_status_created (user_id, status, created_at DESC);\n```\n\nJalankan `EXPLAIN` untuk verifikasi index dipakai.",
                'vote_score'  => 15,
                'is_accepted' => true,
            ]);

            Comment::create([
                'post_id'    => $post2->id,
                'user_id'    => $user->id,
                'parent_id'  => $comment2a->id,
                'body'       => 'Tambah `LIMIT` juga agar tidak fetch semua data sekaligus.',
                'vote_score' => 4,
            ]);

            $post2->update(['is_answered' => true, 'accepted_answer_id' => $comment2a->id]);

            // ── Post 3 ───────────────────────────────────────────
            $post3 = Post::create([
                'user_id'     => $admin->id,
                'category_id' => $catDev->id,
                'title'       => 'Docker Compose untuk Laravel: best practice 2025',
                'body'        => "Setup Docker Compose untuk Laravel (PHP 8.3, MySQL 8, Redis, Nginx).\n\nApa best practice untuk dev vs production? Perlu pisah file compose?",
                'status'      => 'open',
                'vote_score'  => 7,
                'view_count'  => 200,
            ]);
            $post3->tags()->attach([$tagDocker->id, $tagLaravel->id]);

            Comment::create([
                'post_id'    => $post3->id,
                'user_id'    => $mod->id,
                'body'       => "Gunakan `docker-compose.yml` sebagai base dan `docker-compose.override.yml` untuk dev. Production:\n\n```bash\ndocker compose -f docker-compose.yml -f docker-compose.prod.yml up -d\n```",
                'vote_score' => 6,
            ]);

            Comment::create([
                'post_id'    => $post3->id,
                'user_id'    => $user->id,
                'body'       => 'Set `restart: unless-stopped` di production dan jangan commit `.env` ke git.',
                'vote_score' => 2,
            ]);

            // ── Post 4 ───────────────────────────────────────────
            $post4 = Post::create([
                'user_id'     => $user->id,
                'category_id' => $catProg->id,
                'title'       => 'Perbedaan abstract class vs interface di PHP',
                'body'        => "Kapan pakai abstract class dan kapan pakai interface di PHP? Mohon penjelasan dengan contoh nyata.",
                'status'      => 'open',
                'vote_score'  => 9,
                'view_count'  => 280,
            ]);
            $post4->tags()->attach([$tagPHP->id]);

            Comment::create([
                'post_id'    => $post4->id,
                'user_id'    => $admin->id,
                'body'       => "**Interface** → kontrak tanpa implementasi, satu class bisa implement banyak interface.\n\n**Abstract class** → ada shared behavior/implementasi default, hanya bisa extend satu.\n\nContoh: `Payable` cocok jadi interface, `BasePayment` cocok jadi abstract class.",
                'vote_score' => 11,
            ]);

            // ── Post 5 ───────────────────────────────────────────
            $post5 = Post::create([
                'user_id'     => $mod->id,
                'category_id' => $catWeb->id,
                'title'       => 'Implementasi rate limiting di Laravel API',
                'body'        => "Bagaimana setup rate limiting untuk REST API?\n- Login: 10x/menit\n- General: 60x/menit\n\nApakah throttle bawaan Laravel cukup?",
                'status'      => 'open',
                'vote_score'  => 4,
                'view_count'  => 95,
            ]);
            $post5->tags()->attach([$tagLaravel->id, $tagAPI->id]);

            Comment::create([
                'post_id'    => $post5->id,
                'user_id'    => $user->id,
                'body'       => "Cukup, gunakan `RateLimiter::for()` di `AppServiceProvider`:\n\n```php\nRateLimiter::for('login', fn(\$r) => Limit::perMinute(10)->by(\$r->ip()));\nRateLimiter::for('api', fn(\$r) => Limit::perMinute(60)->by(\$r->user()?->id ?: \$r->ip()));\n```",
                'vote_score' => 7,
            ]);

            // ── Votes ─────────────────────────────────────────────
            foreach ([
                [$admin->id, $post1->id,     'post',    'upvote'],
                [$mod->id,   $post1->id,     'post',    'upvote'],
                [$admin->id, $post2->id,     'post',    'upvote'],
                [$user->id,  $post2->id,     'post',    'upvote'],
                [$mod->id,   $post3->id,     'post',    'upvote'],
                [$user->id,  $post4->id,     'post',    'upvote'],
                [$admin->id, $post4->id,     'post',    'upvote'],
                [$user->id,  $post5->id,     'post',    'upvote'],
                [$admin->id, $comment1a->id, 'comment', 'upvote'],
                [$user->id,  $comment1a->id, 'comment', 'upvote'],
                [$mod->id,   $comment2a->id, 'comment', 'upvote'],
                [$user->id,  $comment2a->id, 'comment', 'upvote'],
            ] as [$uid, $tid, $ttype, $vtype]) {
                Vote::firstOrCreate(
                    ['user_id' => $uid, 'target_id' => $tid, 'target_type' => $ttype],
                    ['vote_type' => $vtype]
                );
            }

            // ── Likes ─────────────────────────────────────────────
            foreach ([
                [$admin->id, $post1->id, 'post'],
                [$mod->id,   $post1->id, 'post'],
                [$admin->id, $post2->id, 'post'],
                [$user->id,  $post3->id, 'post'],
                [$mod->id,   $post4->id, 'post'],
            ] as [$uid, $tid, $ttype]) {
                Like::firstOrCreate(
                    ['user_id' => $uid, 'target_id' => $tid, 'target_type' => $ttype]
                );
            }

            // ── Bookmarks ─────────────────────────────────────────
            foreach ([
                [$admin->id, $post2->id],
                [$user->id,  $post1->id],
                [$user->id,  $post3->id],
                [$mod->id,   $post4->id],
            ] as [$uid, $pid]) {
                Bookmark::firstOrCreate(['user_id' => $uid, 'post_id' => $pid]);
            }

            // ── Follows ───────────────────────────────────────────
            foreach ([
                [$user->id, $admin->id],
                [$user->id, $mod->id],
                [$mod->id,  $admin->id],
            ] as [$follower, $following]) {
                Follow::firstOrCreate(['follower_id' => $follower, 'following_id' => $following]);
            }
        });

        $this->command->info('✅ Posts, comments, votes, likes, bookmarks, follows seeded.');
    }
}
