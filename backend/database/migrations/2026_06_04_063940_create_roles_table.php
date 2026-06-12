<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 50)->unique()->comment('admin, moderator, user');
            $table->json('permissions')->nullable();
            $table->timestamp('created_at')->useCurrent();
            // Tidak ada updated_at sesuai ERD
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};