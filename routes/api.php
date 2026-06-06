<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BookmarkController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\FollowController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PostController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\TagController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\VoteController;
use App\Http\Controllers\Api\V1\LikeController;
use Illuminate\Support\Facades\Route;

// ─── Health Check ───────────────────────────────────────────────────────────
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'Forum Diskusi API is up and running!',
        'data'    => [
            'version'     => '1.1.0',
            'environment' => app()->environment(),
            'timestamp'   => now()->toISOString(),
            'timezone'    => config('app.timezone'),
        ],
        'errors' => null,
    ]);
})->name('api.health');

// ─── Auth (Public) ──────────────────────────────────────────────────────────
Route::prefix('v1/auth')->name('api.v1.auth.')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1')->name('register');
    Route::post('/login',    [AuthController::class, 'login'])->middleware('throttle:10,1')->name('login');

    Route::middleware(['auth:sanctum', 'banned'])->group(function () {
        Route::post('/logout',     [AuthController::class, 'logout'])->name('logout');
        Route::post('/logout-all', [AuthController::class, 'logoutAll'])->name('logout-all');
        Route::post('/refresh',    [AuthController::class, 'refresh'])->name('refresh');
        Route::get('/me',          [AuthController::class, 'me'])->name('me');
    });
});

// ─── Public Read-Only ───────────────────────────────────────────────────────
Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::get('categories',            [CategoryController::class, 'index'])->name('categories.index');
    Route::get('categories/{category}', [CategoryController::class, 'show'])->name('categories.show');

    Route::get('tags',       [TagController::class, 'index'])->name('tags.index');
    Route::get('tags/{tag}', [TagController::class, 'show'])->name('tags.show');

    Route::get('posts',                           [PostController::class, 'index'])->name('posts.index');
    Route::get('posts/{post}',                    [PostController::class, 'show'])->name('posts.show');
    Route::get('posts/{post}/comments',           [CommentController::class, 'index'])->name('comments.index');
    Route::get('posts/{post}/comments/{comment}', [CommentController::class, 'show'])->name('comments.show');
    Route::get('posts/{post}/likes',              [LikeController::class, 'index'])->name('posts.likes.index'); // FIX: sub-resource

    Route::get('users/{user}',           [UserController::class, 'show'])->name('users.show');
    Route::get('users/{user}/followers', [FollowController::class, 'followers']);
    Route::get('users/{user}/following', [FollowController::class, 'following']);
});

// ─── Protected (User) ───────────────────────────────────────────────────────
Route::prefix('v1')->name('api.v1.')->middleware(['auth:sanctum', 'banned', 'throttle:60,1'])->group(function () {
    // Posts
    Route::post('posts',                                [PostController::class, 'store'])->name('posts.store');
    Route::put('posts/{post}',                          [PostController::class, 'update'])->name('posts.update');
    Route::patch('posts/{post}',                        [PostController::class, 'update']);
    Route::delete('posts/{post}',                       [PostController::class, 'destroy'])->name('posts.destroy');
    Route::post('posts/{post}/accept-answer/{comment}', [PostController::class, 'acceptAnswer'])->name('posts.accept-answer');

    // Comments
    Route::post('posts/{post}/comments',             [CommentController::class, 'store'])->name('comments.store');
    Route::put('posts/{post}/comments/{comment}',    [CommentController::class, 'update'])->name('comments.update');
    Route::patch('posts/{post}/comments/{comment}',  [CommentController::class, 'update']);
    Route::delete('posts/{post}/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');

    // Likes — FIX: sub-resource, no like_id needed (1 per user per post)
    Route::post('posts/{post}/likes',   [LikeController::class, 'store']);
    Route::delete('posts/{post}/likes', [LikeController::class, 'destroy']);

    // Votes
    Route::post('votes',          [VoteController::class, 'store']);
    Route::delete('votes/{vote}', [VoteController::class, 'destroy']);

    // Bookmarks
    Route::apiResource('bookmarks', BookmarkController::class)->only(['index', 'store', 'destroy']);

    // Follows
    Route::post('users/{user}/follow',     [FollowController::class, 'follow']);
    Route::delete('users/{user}/unfollow', [FollowController::class, 'unfollow']);

    // Notifications — urutan penting: static routes dulu sebelum {notification}
    Route::get('notifications',                        [NotificationController::class, 'index']);
    Route::get('notifications/unread-count',           [NotificationController::class, 'unreadCount']);
    Route::patch('notifications/read-all',             [NotificationController::class, 'markAllRead']);
    Route::patch('notifications/{notification}/read',  [NotificationController::class, 'markRead']); // FIX: model binding

    // Reports
    Route::post('reports', [ReportController::class, 'store']);
});

// ─── Admin ──────────────────────────────────────────────────────────────────
Route::prefix('v1/admin')->name('api.v1.admin.')->middleware(['auth:sanctum', 'banned', 'role:admin', 'throttle:60,1'])->group(function () {
    Route::post('categories',              [CategoryController::class, 'store'])->name('categories.store');
    Route::put('categories/{category}',    [CategoryController::class, 'update'])->name('categories.update');
    Route::patch('categories/{category}',  [CategoryController::class, 'update']);
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::post('tags',        [TagController::class, 'store'])->name('tags.store');
    Route::put('tags/{tag}',   [TagController::class, 'update'])->name('tags.update');
    Route::patch('tags/{tag}', [TagController::class, 'update']);
    Route::delete('tags/{tag}',[TagController::class, 'destroy'])->name('tags.destroy');

    Route::patch('users/{user}/ban',         [AdminController::class, 'banUser']);
    Route::patch('users/{user}/unban',       [AdminController::class, 'unbanUser']);
    Route::get('reports',                    [ReportController::class, 'index']);
    Route::patch('reports/{report}/resolve', [ReportController::class, 'resolve']);
});

// ─── Moderator ──────────────────────────────────────────────────────────────
Route::prefix('v1/moderator')->name('api.v1.mod.')->middleware(['auth:sanctum', 'banned', 'role:admin,moderator', 'throttle:60,1'])->group(function () {
    Route::patch('posts/{post}/close',  [PostController::class, 'close']);
    Route::patch('posts/{post}/reopen', [PostController::class, 'reopen']);
    Route::delete('posts/{post}',       [PostController::class, 'forceDestroy']);
    Route::delete('comments/{comment}', [CommentController::class, 'forceDestroy']);
});
