<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            // Sekarang comments table sudah ada, baru bisa tambahkan FK ini
            $table->foreign('accepted_answer_id')
                ->references('id')
                ->on('comments')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropForeign(['accepted_answer_id']);
        });
    }
};