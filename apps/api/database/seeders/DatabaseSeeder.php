<?php

namespace Database\Seeders;

use App\Models\Prompt;
use App\Models\TestSuite;
use App\Models\TestCase;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Prompt Variants
        $prompt1 = Prompt::create([
            'title' => 'Customer Inquiry Classifier (Strict JSON)',
            'description' => 'Zero-shot classification prompt demanding schema-compliant JSON output',
            'system_prompt' => 'You are an accurate, deterministic customer service classifier. Output valid JSON adhering to the schema: {"urgency": "low|medium|high", "department": "billing|tech|sales", "sentiment": "positive|neutral|negative"}.',
            'user_template' => "Classify the following customer ticket:\n\nMessage: {{customer_message}}\n\nOutput JSON:",
            'parameters' => [
                'temperature' => 0.0,
                'max_tokens' => 200,
                'response_format' => 'json_object',
            ],
            'tags' => ['classification', 'json-mode', 'production'],
        ]);

        $prompt2 = Prompt::create([
            'title' => 'Customer Inquiry Classifier (Few-Shot Chain-of-Thought)',
            'description' => 'Few-shot CoT prompting to reason before concluding category',
            'system_prompt' => 'You are an expert customer service analyst. Reason step-by-step before producing the final JSON result.',
            'user_template' => "Analyze this message:\n{{customer_message}}\n\nFirst provide your brief reasoning, then conclude with the JSON classification in ```json blocks.",
            'parameters' => [
                'temperature' => 0.2,
                'max_tokens' => 450,
            ],
            'tags' => ['cot', 'classification', 'few-shot'],
        ]);

        // 2. Seed Test Suite & Test Cases
        $suite = TestSuite::create([
            'title' => 'Urgent Billing & Outage Tickets',
            'description' => 'High-severity tickets, chargeback disputes, and enterprise outage escalations',
        ]);

        TestCase::create([
            'test_suite_id' => $suite->id,
            'name' => 'Double charge dispute',
            'variables' => [
                'customer_message' => 'I was charged twice $499 on my Visa card this morning! Refund immediately or I dispute with my bank.',
            ],
            'expected_output' => 'billing',
            'expected_schema' => [
                'type' => 'object',
                'required' => ['urgency', 'department', 'sentiment'],
                'properties' => [
                    'urgency' => ['type' => 'string', 'enum' => ['low', 'medium', 'high']],
                    'department' => ['type' => 'string', 'enum' => ['billing', 'tech', 'sales']],
                    'sentiment' => ['type' => 'string', 'enum' => ['positive', 'neutral', 'negative']],
                ],
            ],
        ]);

        TestCase::create([
            'test_suite_id' => $suite->id,
            'name' => 'Enterprise API outage',
            'variables' => [
                'customer_message' => 'Production cluster down with 502 Bad Gateway errors across US-East since 10am UTC!',
            ],
            'expected_output' => 'tech',
            'expected_schema' => [
                'type' => 'object',
                'required' => ['urgency', 'department'],
            ],
        ]);

        TestCase::create([
            'test_suite_id' => $suite->id,
            'name' => 'Enterprise SAML SSO inquiry',
            'variables' => [
                'customer_message' => 'Hi team, we love the product. Do you support Okta SAML SSO on the enterprise plan?',
            ],
            'expected_output' => 'sales',
            'expected_schema' => [
                'type' => 'object',
                'required' => ['department'],
            ],
        ]);
    }
}
