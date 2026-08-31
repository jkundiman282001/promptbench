<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prompt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromptController extends Controller
{
    public function index(): JsonResponse
    {
        $prompts = Prompt::latest()->get();
        return response()->json([
            'success' => true,
            'data' => $prompts,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'system_prompt' => 'nullable|string',
            'user_template' => 'required|string',
            'parameters' => 'nullable|array',
            'tags' => 'nullable|array',
        ]);

        $prompt = Prompt::create($validated);

        return response()->json([
            'success' => true,
            'data' => $prompt,
            'message' => 'Prompt created successfully.',
        ], 201);
    }

    public function show(Prompt $prompt): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $prompt,
        ]);
    }

    public function update(Request $request, Prompt $prompt): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'system_prompt' => 'nullable|string',
            'user_template' => 'sometimes|required|string',
            'parameters' => 'nullable|array',
            'tags' => 'nullable|array',
        ]);

        $prompt->update($validated);

        return response()->json([
            'success' => true,
            'data' => $prompt,
            'message' => 'Prompt updated successfully.',
        ]);
    }

    public function destroy(Prompt $prompt): JsonResponse
    {
        $prompt->delete();
        return response()->json([
            'success' => true,
            'message' => 'Prompt deleted successfully.',
        ]);
    }
}
