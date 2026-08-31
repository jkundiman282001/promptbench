<?php

namespace App\Services\Llm;

use App\Services\Llm\DTOs\LlmCompletionRequest;
use App\Services\Llm\DTOs\LlmCompletionResponse;

interface LlmDriverInterface
{
    /**
     * Send completion request to provider and return normalized response.
     */
    public function complete(LlmCompletionRequest $request): LlmCompletionResponse;

    /**
     * Get the standardized provider identifier.
     */
    public function getProviderName(): string;

    /**
     * Calculate cost in USD given token usage and model name.
     */
    public function calculateCost(string $model, int $inputTokens, int $outputTokens): float;

    /**
     * Check if the driver supports a given model name.
     */
    public function supportsModel(string $model): bool;
}
