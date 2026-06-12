<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('post_id')
                ->constrained('posts')
                ->cascadeOnDelete();
            $table->foreignUuid('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            // Self-referencing: null = top-level comment, filled = reply
            $table->uuid('parent_id')->nullable()
                ->comment('null = top-level, filled = reply');
            $table->text('body');
            $table->integer('vote_score')->default(0);
            $table->boolean('is_accepted')->default(false);
            $table->timestamps();

            // Self-referencing FK
            $table->foreign('parent_id')
                ->references('id')
                ->on('comments')
                ->cascadeOnDelete();

            $table->index('post_id', 'comments_post_id_idx');
            $table->index('user_id', 'comments_user_id_idx');
            $table->index('parent_id', 'comments_parent_id_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};