<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('points_log', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->integer('points')
                ->comment('positif = earn, negatif = deduct');
            $table->string('action_type', 50)
                ->comment('post_upvoted, answer_accepted, comment_upvoted, post_created, dll');
            $table->uuid('reference_id')->nullable()
                ->comment('post_id atau comment_id terkait');
            $table->string('description', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id', 'points_log_user_id_idx');
            $table->index('action_type', 'points_log_action_type_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('points_log');
    }
};