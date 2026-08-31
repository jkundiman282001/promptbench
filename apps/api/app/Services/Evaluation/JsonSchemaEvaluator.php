<?php

namespace App\Services\Evaluation;

class JsonSchemaEvaluator implements EvaluatorInterface
{
    public function getStrategyKey(): string
    {
        return 'json_schema';
    }

    public function evaluate(
        string $actualOutput,
        ?string $expectedOutput = null,
        ?array $expectedSchema = null,
        array $context = []
    ): EvalResult {
        if (empty($expectedSchema)) {
            // Test if output is valid JSON syntax
            $decoded = json_decode($actualOutput, true);
            $isValid = ($decoded !== null && json_last_error() === JSON_ERROR_NONE);

            if (!$isValid) {
                // Try extracting JSON from markdown code block ```json ... ```
                if (preg_match('/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/', $actualOutput, $matches)) {
                    $decoded = json_decode($matches[1], true);
                    $isValid = ($decoded !== null && json_last_error() === JSON_ERROR_NONE);
                }
            }

            return new EvalResult(
                strategy: $this->getStrategyKey(),
                score: $isValid ? 1.0 : 0.0,
                passed: $isValid,
                reasoning: $isValid ? 'Output parsed as valid JSON.' : 'Output is not valid JSON.'
            );
        }

        // Extract JSON from output
        $clean = trim($actualOutput);
        if (preg_match('/\{[\s\S]*\}/', $clean, $matches)) {
            $clean = $matches[0];
        }

        $data = json_decode($clean, true);
        if ($data === null || json_last_error() !== JSON_ERROR_NONE) {
            return new EvalResult(
                strategy: $this->getStrategyKey(),
                score: 0.0,
                passed: false,
                reasoning: 'Output failed JSON syntax parse before schema validation.'
            );
        }

        $missingFields = [];
        if (isset($expectedSchema['required']) && is_array($expectedSchema['required'])) {
            foreach ($expectedSchema['required'] as $field) {
                if (!array_key_exists($field, $data)) {
                    $missingFields[] = $field;
                }
            }
        }

        $passed = empty($missingFields);
        $score = $passed ? 1.0 : max(0.0, 1.0 - (count($missingFields) / max(1, count($expectedSchema['required'] ?? [1]))));

        return new EvalResult(
            strategy: $this->getStrategyKey(),
            score: round($score, 2),
            passed: $passed,
            reasoning: $passed 
                ? 'Output conforms to required schema keys.' 
                : 'Missing required schema fields: ' . implode(', ', $missingFields),
            details: ['parsed_json' => $data, 'missing_fields' => $missingFields]
        );
    }
}
