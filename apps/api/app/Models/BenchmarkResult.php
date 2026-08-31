<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BenchmarkResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'benchmark_run_id',
        'prompt_id',
        'test_case_id',
        'provider',
        'model',
        'rendered_prompt',
        'raw_response',
        'latency_ms',
        'input_tokens',
        'output_tokens',
        'estimated_cost_usd',
        'eval_scores',
        'status',
        'error_message',
    ];

    protected $casts = [
        'eval_scores' => 'array',
        'latency_ms' => 'float',
        'input_tokens' => 'integer',
        'output_tokens' => 'integer',
        'estimated_cost_usd' => 'float',
    ];

    public function benchmarkRun(): BelongsTo
    {
        return $this->belongsTo(BenchmarkRun::class);
    }

    public function prompt(): BelongsTo
    {
        return $this->belongsTo(Prompt::class);
    }

    public function testCase(): BelongsTo
    {
        return $this->belongsTo(TestCase::class);
    }
}
