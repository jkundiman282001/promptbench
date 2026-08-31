<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TestSuite extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
    ];

    public function testCases(): HasMany
    {
        return $this->hasMany(TestCase::class);
    }
}
