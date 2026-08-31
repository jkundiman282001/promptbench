<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Dashboard', [
        'appName' => config('app.name', 'PromptBench'),
        'version' => '1.0.0',
    ]);
})->name('dashboard');
