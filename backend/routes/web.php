<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Voxra Web Service is active',
        'timestamp' => now()->toIso8601String()
    ]);
})->middleware(\App\Http\Middleware\SecurityHeaders::class);
