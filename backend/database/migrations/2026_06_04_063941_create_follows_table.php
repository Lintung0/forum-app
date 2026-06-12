<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('follows', function (Blueprint $table) {
            $table->uuid('id')->primary();
            // follower = yang mengikuti
            $table->uuid('follower_id');
            $table->foreign('follower_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
            // following = yang diikuti
            $table->uuid('following_id');
            $table->foreign('following_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(
                ['follower_id', 'following_id'],
                'follows_unique'
            );
            $table->index('follower_id', 'follows_follower_idx');
            $table->index('following_id', 'follows_following_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('follows');
    }
};