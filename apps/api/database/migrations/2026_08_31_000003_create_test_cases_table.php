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
        Schema::create('test_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_suite_id')->constrained('test_suites')->cascadeOnDelete();
            $table->string('name')->nullable();
            $table->json('variables'); // key-value pairs for prompt template substitution
            $table->text('expected_output')->nullable();
            $table->json('expected_schema')->nullable(); // JSON schema definition
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('test_cases');
    }
};
