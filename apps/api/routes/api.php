<?php

use App\Http\Controllers\Api\BenchmarkController;
use App\Http\Controllers\Api\PromptController;
use App\Http\Controllers\Api\TestSuiteController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'service' => 'promptbench-api',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Models Catalog
Route::get('/models', [BenchmarkController::class, 'models']);

// Prompts CRUD
Route::apiResource('prompts', PromptController::class);

// Test Suites & Cases
Route::apiResource('test-suites', TestSuiteController::class);
Route::post('test-suites/{test_suite}/cases', [TestSuiteController::class, 'addCase']);

// Benchmarking & Telemetry
Route::get('benchmarks', [BenchmarkController::class, 'index']);
Route::post('benchmarks/run', [BenchmarkController::class, 'run']);
Route::get('benchmarks/{benchmark_run}', [BenchmarkController::class, 'show']);
