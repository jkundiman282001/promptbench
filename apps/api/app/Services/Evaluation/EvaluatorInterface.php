<?php

namespace App\Services\Evaluation;

interface EvaluatorInterface
{
    /**
     * Evaluate the LLM output against ground truth or rubric.
     */
    public function evaluate(
        string $actualOutput,
        ?string $expectedOutput = null,
        ?array $expectedSchema = null,
        array $context = []
    ): EvalResult;

    /**
     * Strategy key identifier.
     */
    public function getStrategyKey(): string;
}
