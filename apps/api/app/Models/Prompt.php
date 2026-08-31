<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prompt extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'system_prompt',
        'user_template',
        'parameters',
        'tags',
    ];

    protected $casts = [
        'parameters' => 'array',
        'tags' => 'array',
    ];

    /**
     * Render the template by replacing {{variable}} placeholders with values.
     *
     * @param array<string, mixed> $variables
     */
    public function render(array $variables): string
    {
        $rendered = $this->user_template;
        foreach ($variables as $key => $value) {
            $valStr = is_array($value) || is_object($value) ? json_encode($value) : (string) $value;
            $rendered = str_replace('{{' . $key . '}}', $valStr, $rendered);
        }
        return $rendered;
    }

    public function benchmarkResults(): HasMany
    {
        return $this->hasMany(BenchmarkResult::class);
    }
}
