<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BenchmarkRun;
use App\Services\BenchmarkOrchestratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BenchmarkController extends Controller
{
    public function __construct(
        protected BenchmarkOrchestratorService $orchestrator = new BenchmarkOrchestratorService()
    ) {}

    public function index(): JsonResponse
    {
        $runs = BenchmarkRun::latest()->get();
        return response()->json([
            'success' => true,
            'data' => $runs,
        ]);
    }

    public function show(BenchmarkRun $benchmarkRun): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $benchmarkRun->load(['results.prompt', 'results.testCase']),
        ]);
    }

    public function run(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'prompt_ids' => 'required|array|min:1',
            'prompt_ids.*' => 'integer|exists:prompts,id',
            'test_suite_id' => 'required|integer|exists:test_suites,id',
            'model_ids' => 'required|array|min:1',
            'model_ids.*' => 'string',
        ]);

        $run = $this->orchestrator->executeRun(
            title: $validated['title'],
            promptIds: $validated['prompt_ids'],
            testSuiteId: $validated['test_suite_id'],
            modelIds: $validated['model_ids']
        );

        return response()->json([
            'success' => true,
            'data' => $run,
            'message' => 'Benchmark matrix completed successfully.',
        ], 201);
    }

    public function models(): JsonResponse
    {
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
                    'id' => 'claude-3-5-haiku',
                    'name' => 'Claude 3.5 Haiku',
                    'provider' => 'anthropic',
                    'context_window' => 200000,
                    'input_cost_per_1m' => 0.80,
                    'output_cost_per_1m' => 4.00,
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
                    'id' => 'gemini-1.5-pro',
                    'name' => 'Gemini 1.5 Pro',
                    'provider' => 'gemini',
                    'context_window' => 2097152,
                    'input_cost_per_1m' => 1.25,
                    'output_cost_per_1m' => 5.00,
                    'supports_json_schema' => true,
                ],
                [
                    'id' => 'llama-3.3-70b-versatile',
                    'name' => 'Llama 3.3 70B (Groq)',
                    'provider' => 'groq',
                    'context_window' => 128000,
                    'input_cost_per_1m' => 0.59,
                    'output_cost_per_1m' => 0.79,
                    'supports_json_schema' => true,
                ],
            ],
        ]);
    }
}
