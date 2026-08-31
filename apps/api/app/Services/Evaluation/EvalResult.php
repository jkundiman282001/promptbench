<?php

namespace App\Services\Evaluation;

class EvalResult
{
    public function __construct(
        public readonly string $strategy,
        public readonly float $score,
        public readonly bool $passed,
        public readonly ?string $reasoning = null,
        public readonly array $details = []
    ) {}

    public function toArray(): array
    {
        return [
            'strategy' => $this->strategy,
            'score' => $this->score,
            'passed' => $this->passed,
            'reasoning' => $this->reasoning,
            'details' => $this->details,
        ];
    }
}
