<?php

namespace Tests\Feature;

use App\Models\Prompt;
use App\Models\TestSuite;
use App\Models\TestCase as TestCaseModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BenchmarkApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_check_returns_healthy(): void
    {
        $response = $this->getJson('/api/health');
        $response->assertStatus(200)
            ->assertJson(['status' => 'healthy']);
    }

    public function test_models_catalog_returns_supported_models(): void
    {
        $response = $this->getJson('/api/models');
        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'data' => [['id', 'name', 'provider', 'input_cost_per_1m']]]);
    }

    public function test_prompts_crud_lifecycle(): void
    {
        // 1. Create Prompt
        $postRes = $this->postJson('/api/prompts', [
            'title' => 'Test Classifier',
            'system_prompt' => 'Be concise.',
            'user_template' => 'Classify: {{text}}',
            'parameters' => ['temperature' => 0.0],
            'tags' => ['unit-test'],
        ]);

        $postRes->assertStatus(201)
            ->assertJsonPath('data.title', 'Test Classifier');

        $promptId = $postRes->json('data.id');

        // 2. Read Prompts
        $getRes = $this->getJson('/api/prompts');
        $getRes->assertStatus(200)
            ->assertJsonCount(1, 'data');

        // 3. Update Prompt
        $putRes = $this->putJson("/api/prompts/{$promptId}", [
            'title' => 'Updated Classifier',
        ]);
        $putRes->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated Classifier');

        // 4. Delete Prompt
        $delRes = $this->deleteJson("/api/prompts/{$promptId}");
        $delRes->assertStatus(200);
        $this->assertDatabaseMissing('prompts', ['id' => $promptId]);
    }

    public function test_benchmark_execution_and_telemetry(): void
    {
        // Setup Prompt & Test Suite
        $prompt = Prompt::create([
            'title' => 'Urgency Classifier',
            'system_prompt' => 'Output JSON only.',
            'user_template' => 'Ticket: {{message}}',
            'parameters' => ['temperature' => 0.0],
        ]);

        $suite = TestSuite::create(['title' => 'Urgent Tickets Suite']);
        TestCaseModel::create([
            'test_suite_id' => $suite->id,
            'name' => 'Outage alert',
            'variables' => ['message' => 'System is down!'],
            'expected_output' => 'tech',
            'expected_schema' => ['type' => 'object'],
        ]);

        // Run Benchmark
        $response = $this->postJson('/api/benchmarks/run', [
            'title' => 'Smoke Benchmark Matrix',
            'prompt_ids' => [$prompt->id],
            'test_suite_id' => $suite->id,
            'model_ids' => ['gpt-4o', 'gemini-2.0-flash'],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.total_cases', 2)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'summary_metrics' => [
                        'total_runs',
                        'avg_latency_ms',
                        'total_cost_usd',
                        'pass_rate_percentage',
                        'model_comparisons',
                    ],
                    'results' => [
                        [
                            'id',
                            'provider',
                            'model',
                            'rendered_prompt',
                            'raw_response',
                            'latency_ms',
                            'eval_scores',
                        ]
                    ]
                ]
            ]);

        $runId = $response->json('data.id');

        // Get Benchmark Details
        $showRes = $this->getJson("/api/benchmarks/{$runId}");
        $showRes->assertStatus(200)
            ->assertJsonPath('data.id', $runId);
    }
}
