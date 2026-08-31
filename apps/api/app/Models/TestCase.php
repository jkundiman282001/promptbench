<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TestCase extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_suite_id',
        'name',
        'variables',
        'expected_output',
        'expected_schema',
    ];

    protected $casts = [
        'variables' => 'array',
        'expected_schema' => 'array',
    ];

    public function testSuite(): BelongsTo
    {
        return $this->belongsTo(TestSuite::class);
    }

    public function benchmarkResults(): HasMany
    {
        return $this->hasMany(BenchmarkResult::class);
    }
}
