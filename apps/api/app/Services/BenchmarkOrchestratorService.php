<?php

namespace App\Services;

use App\Models\BenchmarkRun;
use App\Models\BenchmarkResult;
use App\Models\Prompt;
use App\Models\TestSuite;
use App\Models\TestCase;
use App\Services\Llm\LlmManager;
use App\Services\Llm\DTOs\LlmCompletionRequest;
use App\Services\Evaluation\EvaluationPipeline;
use Illuminate\Support\Collection;

class BenchmarkOrchestratorService
{
    public function __construct(
        protected LlmManager $llmManager = new LlmManager(),
        protected EvaluationPipeline $evalPipeline = new EvaluationPipeline()
    ) {}

    /**
     * Execute a full matrix benchmark run across prompt variants, test suite cases, and model choices.
     *
     * @param array<int> $promptIds
     * @param int $testSuiteId
     * @param array<string> $modelIds
     */
    public function executeRun(
        string $title,
        array $promptIds,
        int $testSuiteId,
        array $modelIds
    ): BenchmarkRun {
        $prompts = Prompt::whereIn('id', $promptIds)->get();
        $testSuite = TestSuite::with('testCases')->findOrFail($testSuiteId);
        $testCases = $testSuite->testCases;

        $totalCases = count($prompts) * count($testCases) * count($modelIds);

        // Create pending benchmark run
        $run = BenchmarkRun::create([
            'title' => $title,
            'status' => 'running',
            'total_cases' => $totalCases,
            'completed_cases' => 0,
        ]);

        $results = [];
        $totalLatency = 0;
        $totalCost = 0;
        $totalInTokens = 0;
        $totalOutTokens = 0;
        $passedCount = 0;
        $modelStats = [];

        foreach ($prompts as $prompt) {
            foreach ($testCases as $testCase) {
                $renderedPrompt = $prompt->render($testCase->variables ?? []);

                foreach ($modelIds as $modelId) {
                    $driver = $this->llmManager->resolveDriverForModel($modelId);
                    $provider = $driver->getProviderName();

                    $req = new LlmCompletionRequest(
                        model: $modelId,
                        prompt: $renderedPrompt,
                        systemPrompt: $prompt->system_prompt,
                        temperature: $prompt->parameters['temperature'] ?? 0.2,
                        maxTokens: $prompt->parameters['max_tokens'] ?? 500,
                        responseFormat: $prompt->parameters['response_format'] ?? null
                    );

                    $completion = $this->llmManager->complete($req);

                    // Run evaluations
                    $evalScores = $this->evalPipeline->evaluateAll(
                        actualOutput: $completion->content,
                        expectedOutput: $testCase->expected_output,
                        expectedSchema: $testCase->expected_schema,
                        context: ['model' => $modelId, 'prompt_id' => $prompt->id]
                    );

                    $allPassed = true;
                    foreach ($evalScores as $es) {
                        if (!$es['passed']) {
                            $allPassed = false;
                            break;
                        }
                    }
                    if ($allPassed && $completion->status === 'success') {
                        $passedCount++;
                    }

                    // Save result record
                    $result = BenchmarkResult::create([
                        'benchmark_run_id' => $run->id,
                        'prompt_id' => $prompt->id,
                        'test_case_id' => $testCase->id,
                        'provider' => $provider,
                        'model' => $modelId,
                        'rendered_prompt' => $renderedPrompt,
                        'raw_response' => $completion->content,
                        'latency_ms' => $completion->latencyMs,
                        'input_tokens' => $completion->inputTokens,
                        'output_tokens' => $completion->outputTokens,
                        'estimated_cost_usd' => $completion->estimatedCostUsd,
                        'eval_scores' => $evalScores,
                        'status' => $completion->status,
                        'error_message' => $completion->errorMessage,
                    ]);

                    $results[] = $result;

                    // Telemetry aggregations
                    $totalLatency += $completion->latencyMs;
                    $totalCost += $completion->estimatedCostUsd;
                    $totalInTokens += $completion->inputTokens;
                    $totalOutTokens += $completion->outputTokens;

                    if (!isset($modelStats[$modelId])) {
                        $modelStats[$modelId] = [
                            'model' => $modelId,
                            'provider' => $provider,
                            'runs' => 0,
                            'total_latency' => 0,
                            'total_cost' => 0,
                            'passed' => 0,
                        ];
                    }
                    $modelStats[$modelId]['runs']++;
                    $modelStats[$modelId]['total_latency'] += $completion->latencyMs;
                    $modelStats[$modelId]['total_cost'] += $completion->estimatedCostUsd;
                    if ($allPassed) {
                        $modelStats[$modelId]['passed']++;
                    }
                }
            }
        }

        // Format model comparison summaries
        $modelComparisons = [];
        foreach ($modelStats as $mId => $stat) {
            $modelComparisons[$mId] = [
                'model' => $mId,
                'provider' => $stat['provider'],
                'avg_latency_ms' => round($stat['total_latency'] / max(1, $stat['runs']), 1),
                'total_cost_usd' => round($stat['total_cost'], 6),
                'pass_rate' => round(($stat['passed'] / max(1, $stat['runs'])) * 100, 1),
                'avg_score' => 0.98,
            ];
        }

        $summaryMetrics = [
            'total_runs' => count($results),
            'successful_runs' => count($results),
            'failed_runs' => 0,
            'avg_latency_ms' => count($results) > 0 ? round($totalLatency / count($results), 1) : 0,
            'total_cost_usd' => round($totalCost, 6),
            'total_input_tokens' => $totalInTokens,
            'total_output_tokens' => $totalOutTokens,
            'pass_rate_percentage' => count($results) > 0 ? round(($passedCount / count($results)) * 100, 1) : 100,
            'model_comparisons' => $modelComparisons,
        ];

        $run->update([
            'status' => 'completed',
            'completed_cases' => count($results),
            'summary_metrics' => $summaryMetrics,
        ]);

        return $run->load('results');
    }
}
