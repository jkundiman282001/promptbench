<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BenchmarkRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'status',
        'total_cases',
        'completed_cases',
        'summary_metrics',
    ];

    protected $casts = [
        'summary_metrics' => 'array',
    ];

    public function results(): HasMany
    {
        return $this->hasMany(BenchmarkResult::class);
    }
}
