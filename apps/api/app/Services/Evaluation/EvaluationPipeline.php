<?php

namespace App\Services\Evaluation;

class EvaluationPipeline
{
    /** @var array<string, EvaluatorInterface> */
    protected array $evaluators = [];

    public function __construct()
    {
        $this->register(new ExactMatchEvaluator());
        $this->register(new RegexEvaluator());
        $this->register(new JsonSchemaEvaluator());
        $this->register(new LlmJudgeEvaluator());
    }

    public function register(EvaluatorInterface $evaluator): void
    {
        $this->evaluators[$evaluator->getStrategyKey()] = $evaluator;
    }

    /**
     * Run all evaluators for a completion output and return score map.
     *
     * @return array<string, array>
     */
    public function evaluateAll(
        string $actualOutput,
        ?string $expectedOutput = null,
        ?array $expectedSchema = null,
        array $context = []
    ): array {
        $results = [];
        foreach ($this->evaluators as $key => $evaluator) {
            $evalResult = $evaluator->evaluate($actualOutput, $expectedOutput, $expectedSchema, $context);
            $results[$key] = $evalResult->toArray();
        }
        return $results;
    }
}
