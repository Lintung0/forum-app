<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignUuid('category_id')
                ->constrained('categories')
                ->restrictOnDelete();
            $table->string('title', 300);
            $table->text('body');
            $table->string('status', 20)
                ->default('open')
                ->comment('open, closed, deleted');
            $table->integer('view_count')->default(0);
            $table->integer('vote_score')->default(0);
            $table->boolean('is_answered')->default(false);
            // FK ke comments.id ditambahkan setelah comments table dibuat
            $table->uuid('accepted_answer_id')->nullable()
                ->comment('FK ke comments.id — ditambahkan via migration terpisah');
            $table->timestamps();

            $table->index('user_id', 'posts_user_id_idx');
            $table->index('category_id', 'posts_category_id_idx');
            $table->index('status', 'posts_status_idx');
            $table->index('created_at', 'posts_created_at_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};