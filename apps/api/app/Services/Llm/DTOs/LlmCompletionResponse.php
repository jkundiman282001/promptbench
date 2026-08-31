<?php

namespace App\Services\Llm\DTOs;

class LlmCompletionResponse
{
    public function __construct(
        public readonly string $model,
        public readonly string $provider,
        public readonly string $content,
        public readonly float $latencyMs,
        public readonly int $inputTokens,
        public readonly int $outputTokens,
        public readonly float $estimatedCostUsd,
        public readonly string $status = 'success',
        public readonly ?string $errorMessage = null,
        public readonly array $rawMeta = []
    ) {}

    public static function error(
        string $model,
        string $provider,
        string $errorMessage,
        float $latencyMs = 0
    ): self {
        return new self(
            model: $model,
            provider: $provider,
            content: '',
            latencyMs: $latencyMs,
            inputTokens: 0,
            outputTokens: 0,
            estimatedCostUsd: 0,
            status: 'error',
            errorMessage: $errorMessage
        );
    }
}
