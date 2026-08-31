<?php

use Illuminate\Http\Request;
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

Route::get('/models', function () {
    return response()->json([
        'success' => true,
        'data' => [
            [
                'id' => 'gpt-4o',
                'name' => 'GPT-4o',
                'provider' => 'openai',
                'context_window' => 128000,
                'input_cost_per_1m' => 2.50,
                'output_cost_per_1m' => 10.00,
                'supports_json_schema' => true,
            ],
            [
                'id' => 'gpt-4o-mini',
                'name' => 'GPT-4o Mini',
                'provider' => 'openai',
                'context_window' => 128000,
                'input_cost_per_1m' => 0.15,
                'output_cost_per_1m' => 0.60,
                'supports_json_schema' => true,
            ],
            [
                'id' => 'claude-3-5-sonnet',
                'name' => 'Claude 3.5 Sonnet',
                'provider' => 'anthropic',
                'context_window' => 200000,
                'input_cost_per_1m' => 3.00,
                'output_cost_per_1m' => 15.00,
                'supports_json_schema' => true,
            ],
            [
                'id' => 'gemini-2.0-flash',
                'name' => 'Gemini 2.0 Flash',
                'provider' => 'gemini',
                'context_window' => 1048576,
                'input_cost_per_1m' => 0.10,
                'output_cost_per_1m' => 0.40,
                'supports_json_schema' => true,
            ],
            [
                'id' => 'llama-3.3-70b',
                'name' => 'Llama 3.3 70B',
                'provider' => 'groq',
                'context_window' => 128000,
                'input_cost_per_1m' => 0.59,
                'output_cost_per_1m' => 0.79,
                'supports_json_schema' => true,
            ],
        ],
    ]);
});
