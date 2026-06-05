<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forum_notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            // user_id = penerima notifikasi
            $table->foreignUuid('user_id')
                ->constrained('users')
                ->cascadeOnDelete()
                ->comment('penerima notifikasi');
            // actor_id = siapa yang memicu notifikasi (bisa null jika sistem)
            $table->uuid('actor_id')->nullable()
                ->comment('siapa yang memicu notifikasi');
            $table->foreign('actor_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
            $table->string('type', 50)
                ->comment('reply, like, upvote, follow, answer_accepted, mention');
            $table->uuid('reference_id')->nullable()
                ->comment('post_id atau comment_id terkait');
            $table->string('reference_type', 20)->nullable()
                ->comment('post, comment');
            $table->boolean('is_read')->default(false);
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id', 'notifications_user_id_idx');
            $table->index(['user_id', 'is_read'], 'notifications_user_unread_idx');
            $table->index('created_at', 'notifications_created_at_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forum_notifications');
    }
};