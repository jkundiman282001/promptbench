<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('benchmark_runs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('status')->default('pending'); // pending, running, completed, failed
            $table->integer('total_cases')->default(0);
            $table->integer('completed_cases')->default(0);
            $table->json('summary_metrics')->nullable(); // average latency, pass rates, model comparisons
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('benchmark_runs');
    }
};
