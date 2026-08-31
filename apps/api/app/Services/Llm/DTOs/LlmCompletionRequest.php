<?php

namespace App\Services\Llm\DTOs;

class LlmCompletionRequest
{
    public function __construct(
        public readonly string $model,
        public readonly string $prompt,
        public readonly ?string $systemPrompt = null,
        public readonly float $temperature = 0.2,
        public readonly ?int $maxTokens = 500,
        public readonly ?string $responseFormat = null,
        public readonly array $metadata = []
    ) {}
}
