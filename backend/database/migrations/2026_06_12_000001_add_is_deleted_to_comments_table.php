<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->boolean('is_deleted')->default(false)->after('is_accepted');
            $table->index(['is_deleted'], 'comments_is_deleted_idx');
        });
    }

    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->dropIndex('comments_is_deleted_idx');
            $table->dropColumn('is_deleted');
        });
    }
};
