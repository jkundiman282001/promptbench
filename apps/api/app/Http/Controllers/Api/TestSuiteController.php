<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TestSuite;
use App\Models\TestCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestSuiteController extends Controller
{
    public function index(): JsonResponse
    {
        $suites = TestSuite::withCount('testCases')->with('testCases')->latest()->get();
        return response()->json([
            'success' => true,
            'data' => $suites,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $suite = TestSuite::create($validated);

        return response()->json([
            'success' => true,
            'data' => $suite,
            'message' => 'Test suite created successfully.',
        ], 201);
    }

    public function show(TestSuite $testSuite): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $testSuite->load('testCases'),
        ]);
    }

    public function addCase(Request $request, TestSuite $testSuite): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'variables' => 'required|array',
            'expected_output' => 'nullable|string',
            'expected_schema' => 'nullable|array',
        ]);

        $case = $testSuite->testCases()->create($validated);

        return response()->json([
            'success' => true,
            'data' => $case,
            'message' => 'Test case added successfully.',
        ], 201);
    }

    public function destroy(TestSuite $testSuite): JsonResponse
    {
        $testSuite->delete();
        return response()->json([
            'success' => true,
            'message' => 'Test suite deleted successfully.',
        ]);
    }
}
