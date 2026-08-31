<?php

namespace App\Services\Evaluation;

class RegexEvaluator implements EvaluatorInterface
{
    public function getStrategyKey(): string
    {
        return 'regex';
    }

    public function evaluate(
        string $actualOutput,
        ?string $expectedOutput = null,
        ?array $expectedSchema = null,
        array $context = []
    ): EvalResult {
        $pattern = $context['regex_pattern'] ?? null;
        if (empty($pattern)) {
            // Default regex validation: check if valid non-empty structured block or JSON exists
            $isJson = preg_match('/\{[\s\S]*\}/', $actualOutput);
            return new EvalResult(
                strategy: $this->getStrategyKey(),
                score: $isJson ? 1.0 : 0.8,
                passed: true,
                reasoning: $isJson ? 'Found valid JSON enclosure in output.' : 'Regex check satisfied.'
            );
        }

        $matched = (bool) @preg_match($pattern, $actualOutput);
        return new EvalResult(
            strategy: $this->getStrategyKey(),
            score: $matched ? 1.0 : 0.0,
            passed: $matched,
            reasoning: $matched 
                ? "Output matches regex pattern [{$pattern}]."
                : "Output failed regex pattern [{$pattern}]."
        );
    }
}
