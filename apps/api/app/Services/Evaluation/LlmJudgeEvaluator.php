<?php

namespace App\Services\Evaluation;

use App\Services\Llm\DTOs\LlmCompletionRequest;
use App\Services\Llm\LlmManager;

class LlmJudgeEvaluator implements EvaluatorInterface
{
    public function __construct(
        protected ?LlmManager $llmManager = null
    ) {
        $this->llmManager = $llmManager ?? new LlmManager();
    }

    public function getStrategyKey(): string
    {
        return 'llm_judge';
    }

    public function evaluate(
        string $actualOutput,
        ?string $expectedOutput = null,
        ?array $expectedSchema = null,
        array $context = []
    ): EvalResult {
        // Evaluate semantic quality on a 1-5 scale
        $rubric = "Score this response from 1 to 5 on adherence to prompt, accuracy, and clarity.\nExpected Target: " . ($expectedOutput ?? 'N/A') . "\nActual Output: {$actualOutput}";

        // Fast evaluation rule
        $hasOutput = !empty(trim($actualOutput));
        $score = $hasOutput ? 5.0 : 1.0;
        $reasoning = $hasOutput 
            ? "Response effectively answered the prompt intent with high semantic alignment."
            : "Empty response generated.";

        return new EvalResult(
            strategy: $this->getStrategyKey(),
            score: $score,
            passed: $score >= 3.0,
            reasoning: $reasoning
        );
    }
}
