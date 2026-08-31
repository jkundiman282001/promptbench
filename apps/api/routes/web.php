<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name', 'PromptBench API'),
        'service' => 'PromptBench Core REST API',
        'status' => 'operational',
        'version' => '1.0.0',
    ]);
});
