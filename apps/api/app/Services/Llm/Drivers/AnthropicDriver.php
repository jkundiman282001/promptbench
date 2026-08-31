<?php

namespace App\Services\Llm\Drivers;

use App\Services\Llm\DTOs\LlmCompletionRequest;
use App\Services\Llm\DTOs\LlmCompletionResponse;
use App\Services\Llm\LlmDriverInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AnthropicDriver implements LlmDriverInterface
{
    protected ?string $apiKey;
    protected string $baseUrl;

    // Pricing per 1M tokens: [input, output]
    protected array $pricing = [
        'claude-3-5-sonnet' => [3.00, 15.00],
        'claude-3-5-haiku' => [0.80, 4.00],
        'claude-3-opus' => [15.00, 75.00],
    ];

    public function __construct(?string $apiKey = null, ?string $baseUrl = null)
    {
        $this->apiKey = $apiKey ?? config('services.anthropic.api_key', env('ANTHROPIC_API_KEY'));
        $this->baseUrl = $baseUrl ?? 'https://api.anthropic.com/v1';
    }

    public function getProviderName(): string
    {
        return 'anthropic';
    }

    public function supportsModel(string $model): bool
    {
        return str_starts_with($model, 'claude-') || str_contains($model, 'anthropic');
    }

    public function calculateCost(string $model, int $inputTokens, int $outputTokens): float
    {
        $normalized = 'claude-3-5-sonnet';
        foreach (array_keys($this->pricing) as $key) {
            if (str_contains(strtolower($model), $key)) {
                $normalized = $key;
                break;
            }
        }
        $rates = $this->pricing[$normalized] ?? [3.00, 15.00];
        $inputCost = ($inputTokens / 1_000_000) * $rates[0];
        $outputCost = ($outputTokens / 1_000_000) * $rates[1];
        return round($inputCost + $outputCost, 6);
    }

    public function complete(LlmCompletionRequest $request): LlmCompletionResponse
    {
        $startTime = microtime(true);

        // Dry-run simulation when no API key is provided
        if (empty($this->apiKey)) {
            $latencyMs = round((microtime(true) - $startTime) * 1000 + rand(180, 350), 2);
            $simulatedTokensIn = max(20, (int) (strlen($request->prompt) / 4));
            $simulatedOutput = "{\n  \"urgency\": \"high\",\n  \"department\": \"billing\",\n  \"sentiment\": \"negative\"\n}";
            $simulatedTokensOut = max(10, (int) (strlen($simulatedOutput) / 4));
            $cost = $this->calculateCost($request->model, $simulatedTokensIn, $simulatedTokensOut);

            return new LlmCompletionResponse(
                model: $request->model,
                provider: $this->getProviderName(),
                content: $simulatedOutput,
                latencyMs: $latencyMs,
                inputTokens: $simulatedTokensIn,
                outputTokens: $simulatedTokensOut,
                estimatedCostUsd: $cost,
                status: 'success',
                rawMeta: ['simulation' => true, 'notice' => 'Configure ANTHROPIC_API_KEY in .env for live API calls']
            );
        }

        try {
            $payload = [
                'model' => $request->model,
                'max_tokens' => $request->maxTokens ?? 1000,
                'temperature' => $request->temperature,
                'messages' => [
                    ['role' => 'user', 'content' => $request->prompt],
                ],
            ];

            if ($request->systemPrompt) {
                $payload['system'] = $request->systemPrompt;
            }

            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->timeout(60)->post("{$this->baseUrl}/messages", $payload);

            $latencyMs = round((microtime(true) - $startTime) * 1000, 2);

            if ($response->failed()) {
                Log::error("Anthropic API error", ['body' => $response->body()]);
                return LlmCompletionResponse::error(
                    $request->model,
                    $this->getProviderName(),
                    "Anthropic API error [{$response->status()}]: " . ($response->json('error.message') ?? $response->body()),
                    $latencyMs
                );
            }

            $data = $response->json();
            $content = $data['content'][0]['text'] ?? '';
            $inputTokens = $data['usage']['input_tokens'] ?? 0;
            $outputTokens = $data['usage']['output_tokens'] ?? 0;
            $cost = $this->calculateCost($request->model, $inputTokens, $outputTokens);

            return new LlmCompletionResponse(
                model: $request->model,
                provider: $this->getProviderName(),
                content: $content,
                latencyMs: $latencyMs,
                inputTokens: $inputTokens,
                outputTokens: $outputTokens,
                estimatedCostUsd: $cost,
                status: 'success',
                rawMeta: $data
            );
        } catch (\Throwable $e) {
            $latencyMs = round((microtime(true) - $startTime) * 1000, 2);
            return LlmCompletionResponse::error(
                $request->model,
                $this->getProviderName(),
                $e->getMessage(),
                $latencyMs
            );
        }
    }
}
