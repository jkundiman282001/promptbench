<?php

namespace App\Services\Evaluation;

class ExactMatchEvaluator implements EvaluatorInterface
{
    public function getStrategyKey(): string
    {
        return 'exact_match';
    }

    public function evaluate(
        string $actualOutput,
        ?string $expectedOutput = null,
        ?array $expectedSchema = null,
        array $context = []
    ): EvalResult {
        if ($expectedOutput === null) {
            return new EvalResult(
                strategy: $this->getStrategyKey(),
                score: 1.0,
                passed: true,
                reasoning: 'No expected output defined for exact match comparison.'
            );
        }

        $normActual = trim(strtolower($actualOutput));
        $normExpected = trim(strtolower($expectedOutput));

        $matched = ($normActual === $normExpected) || str_contains($normActual, $normExpected);
        $score = $matched ? 1.0 : 0.0;

        return new EvalResult(
            strategy: $this->getStrategyKey(),
            score: $score,
            passed: $matched,
            reasoning: $matched 
                ? "Output contains expected target string [{$expectedOutput}]."
                : "Output does not contain target string [{$expectedOutput}]."
        );
    }
}
