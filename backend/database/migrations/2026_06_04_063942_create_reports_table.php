<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('reporter_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->uuid('target_id')
                ->comment('post_id, comment_id, atau user_id');
            $table->string('target_type', 20)
                ->comment('post, comment, user');
            $table->string('reason', 100)
                ->comment('spam, harassment, misinformation, inappropriate, dll');
            $table->text('description')->nullable();
            $table->string('status', 20)
                ->default('pending')
                ->comment('pending, reviewed, resolved, dismissed');
            $table->uuid('resolved_by')->nullable()
                ->comment('moderator user_id');
            $table->foreign('resolved_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('resolved_at')->nullable();

            $table->index('reporter_id', 'reports_reporter_id_idx');
            $table->index(['target_id', 'target_type'], 'reports_target_idx');
            $table->index('status', 'reports_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};