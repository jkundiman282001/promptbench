<?php

namespace App\Services\Llm\Drivers;

use App\Services\Llm\DTOs\LlmCompletionRequest;
use App\Services\Llm\DTOs\LlmCompletionResponse;
use App\Services\Llm\LlmDriverInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqDriver implements LlmDriverInterface
{
    protected ?string $apiKey;
    protected string $baseUrl;

    // Pricing per 1M tokens: [input, output]
    protected array $pricing = [
        'llama-3.3-70b-versatile' => [0.59, 0.79],
        'llama-3.1-8b-instant' => [0.05, 0.08],
        'mixtral-8x7b-32768' => [0.24, 0.24],
    ];

    public function __construct(?string $apiKey = null, ?string $baseUrl = null)
    {
        $this->apiKey = $apiKey ?? config('services.groq.api_key', env('GROQ_API_KEY'));
        $this->baseUrl = $baseUrl ?? 'https://api.groq.com/openai/v1';
    }

    public function getProviderName(): string
    {
        return 'groq';
    }

    public function supportsModel(string $model): bool
    {
        return str_starts_with($model, 'llama-') || str_starts_with($model, 'mixtral') || str_starts_with($model, 'gemma') || str_contains($model, 'groq');
    }

    public function calculateCost(string $model, int $inputTokens, int $outputTokens): float
    {
        $rates = $this->pricing[$model] ?? [0.59, 0.79];
        $inputCost = ($inputTokens / 1_000_000) * $rates[0];
        $outputCost = ($outputTokens / 1_000_000) * $rates[1];
        return round($inputCost + $outputCost, 6);
    }

    public function complete(LlmCompletionRequest $request): LlmCompletionResponse
    {
        $startTime = microtime(true);

        // Dry-run simulation when no API key is provided
        if (empty($this->apiKey)) {
            $latencyMs = round((microtime(true) - $startTime) * 1000 + rand(80, 180), 2);
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
                rawMeta: ['simulation' => true, 'notice' => 'Configure GROQ_API_KEY in .env for live API calls']
            );
        }

        try {
            $messages = [];
            if ($request->systemPrompt) {
                $messages[] = ['role' => 'system', 'content' => $request->systemPrompt];
            }
            $messages[] = ['role' => 'user', 'content' => $request->prompt];

            $payload = [
                'model' => $request->model,
                'messages' => $messages,
                'temperature' => $request->temperature,
                'max_tokens' => $request->maxTokens,
            ];

            if ($request->responseFormat === 'json_object') {
                $payload['response_format'] = ['type' => 'json_object'];
            }

            $response = Http::withToken($this->apiKey)
                ->timeout(60)
                ->post("{$this->baseUrl}/chat/completions", $payload);

            $latencyMs = round((microtime(true) - $startTime) * 1000, 2);

            if ($response->failed()) {
                Log::error("Groq API error", ['body' => $response->body()]);
                return LlmCompletionResponse::error(
                    $request->model,
                    $this->getProviderName(),
                    "Groq API error [{$response->status()}]: " . ($response->json('error.message') ?? $response->body()),
                    $latencyMs
                );
            }

            $data = $response->json();
            $content = $data['choices'][0]['message']['content'] ?? '';
            $inputTokens = $data['usage']['prompt_tokens'] ?? 0;
            $outputTokens = $data['usage']['completion_tokens'] ?? 0;
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
