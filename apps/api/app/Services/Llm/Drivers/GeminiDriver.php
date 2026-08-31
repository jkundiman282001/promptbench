<?php

namespace App\Services\Llm\Drivers;

use App\Services\Llm\DTOs\LlmCompletionRequest;
use App\Services\Llm\DTOs\LlmCompletionResponse;
use App\Services\Llm\LlmDriverInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiDriver implements LlmDriverInterface
{
    protected ?string $apiKey;
    protected string $baseUrl;

    // Pricing per 1M tokens: [input, output]
    protected array $pricing = [
        'gemini-2.0-flash' => [0.10, 0.40],
        'gemini-1.5-flash' => [0.075, 0.30],
        'gemini-1.5-pro' => [1.25, 5.00],
    ];

    public function __construct(?string $apiKey = null, ?string $baseUrl = null)
    {
        $this->apiKey = $apiKey ?? config('services.gemini.api_key', env('GEMINI_API_KEY'));
        $this->baseUrl = $baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta/models';
    }

    public function getProviderName(): string
    {
        return 'gemini';
    }

    public function supportsModel(string $model): bool
    {
        return str_starts_with($model, 'gemini-') || str_contains($model, 'google');
    }

    public function calculateCost(string $model, int $inputTokens, int $outputTokens): float
    {
        $rates = $this->pricing[$model] ?? [0.10, 0.40];
        $inputCost = ($inputTokens / 1_000_000) * $rates[0];
        $outputCost = ($outputTokens / 1_000_000) * $rates[1];
        return round($inputCost + $outputCost, 6);
    }

    public function complete(LlmCompletionRequest $request): LlmCompletionResponse
    {
        $startTime = microtime(true);

        // Dry-run simulation when no API key is provided
        if (empty($this->apiKey)) {
            $latencyMs = round((microtime(true) - $startTime) * 1000 + rand(100, 220), 2);
            $simulatedTokensIn = max(20, (int) (strlen($request->prompt) / 4));
            $simulatedOutput = '{"urgency": "high", "department": "billing", "sentiment": "negative"}';
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
                rawMeta: ['simulation' => true, 'notice' => 'Configure GEMINI_API_KEY in .env for live API calls']
            );
        }

        try {
            $modelName = str_replace('models/', '', $request->model);
            $url = "{$this->baseUrl}/{$modelName}:generateContent?key={$this->apiKey}";

            $contents = [
                [
                    'role' => 'user',
                    'parts' => [['text' => $request->prompt]],
                ],
            ];

            $generationConfig = [
                'temperature' => $request->temperature,
                'maxOutputTokens' => $request->maxTokens ?? 1000,
            ];

            if ($request->responseFormat === 'json_object') {
                $generationConfig['responseMimeType'] = 'application/json';
            }

            $payload = [
                'contents' => $contents,
                'generationConfig' => $generationConfig,
            ];

            if ($request->systemPrompt) {
                $payload['systemInstruction'] = [
                    'parts' => [['text' => $request->systemPrompt]],
                ];
            }

            $response = Http::timeout(60)->post($url, $payload);
            $latencyMs = round((microtime(true) - $startTime) * 1000, 2);

            if ($response->failed()) {
                Log::error("Gemini API error", ['body' => $response->body()]);
                return LlmCompletionResponse::error(
                    $request->model,
                    $this->getProviderName(),
                    "Gemini API error [{$response->status()}]: " . ($response->json('error.message') ?? $response->body()),
                    $latencyMs
                );
            }

            $data = $response->json();
            $content = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
            $inputTokens = $data['usageMetadata']['promptTokenCount'] ?? 0;
            $outputTokens = $data['usageMetadata']['candidatesTokenCount'] ?? 0;
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
