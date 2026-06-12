<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('post_edit_history', function (Blueprint $table) {

            $table->dropForeign(['edited_by']);

            $table->uuid('edited_by')
                ->nullable()
                ->change();

            $table->foreign('edited_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });

        Schema::table('comment_edit_history', function (Blueprint $table) {

            $table->dropForeign(['edited_by']);

            $table->uuid('edited_by')
                ->nullable()
                ->change();

            $table->foreign('edited_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('post_edit_history', function (Blueprint $table) {

            $table->dropForeign(['edited_by']);

            $table->uuid('edited_by')
                ->nullable(false)
                ->change();

            $table->foreign('edited_by')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });

        Schema::table('comment_edit_history', function (Blueprint $table) {

            $table->dropForeign(['edited_by']);

            $table->uuid('edited_by')
                ->nullable(false)
                ->change();

            $table->foreign('edited_by')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }
};