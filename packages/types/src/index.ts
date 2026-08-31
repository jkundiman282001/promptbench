/**
 * PromptBench Core Shared Domain Types & Interfaces
 */

export type LlmProviderType = 'openai' | 'anthropic' | 'gemini' | 'groq' | 'openrouter' | 'ollama';

export type EvalStrategyType = 'exact_match' | 'regex' | 'json_schema' | 'llm_judge';

export type RunStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface PromptParameter {
    temperature: number;
    top_p?: number;
    max_tokens?: number;
    stop?: string[];
    response_format?: 'text' | 'json_object';
}

export interface Prompt {
    id: number | string;
    title: string;
    description?: string | null;
    system_prompt?: string | null;
    user_template: string;
    parameters: PromptParameter;
    tags?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface TestCase {
    id: number | string;
    test_suite_id: number | string;
    name?: string;
    variables: Record<string, any>;
    expected_output?: string | null;
    expected_schema?: Record<string, any> | null;
    created_at?: string;
    updated_at?: string;
}

export interface TestSuite {
    id: number | string;
    title: string;
    description?: string | null;
    test_cases_count?: number;
    test_cases?: TestCase[];
    created_at?: string;
    updated_at?: string;
}

export interface EvalScore {
    strategy: EvalStrategyType;
    score: number; // 0.0 to 1.0 or 1 to 5
    passed: boolean;
    reasoning?: string;
    details?: Record<string, any>;
}

export interface BenchmarkResult {
    id: number | string;
    benchmark_run_id: number | string;
    prompt_id: number | string;
    prompt?: Prompt;
    test_case_id: number | string;
    test_case?: TestCase;
    provider: LlmProviderType;
    model: string;
    rendered_prompt: string;
    raw_response: string;
    latency_ms: number;
    input_tokens: number;
    output_tokens: number;
    estimated_cost_usd: number;
    eval_scores: Record<EvalStrategyType, EvalScore>;
    status: 'success' | 'error';
    error_message?: string | null;
    created_at?: string;
}

export interface BenchmarkMetricsSummary {
    total_runs: number;
    successful_runs: number;
    failed_runs: number;
    avg_latency_ms: number;
    total_cost_usd: number;
    total_input_tokens: number;
    total_output_tokens: number;
    pass_rate_percentage: number;
    model_comparisons: Record<string, {
        model: string;
        provider: LlmProviderType;
        avg_latency_ms: number;
        total_cost_usd: number;
        pass_rate: number;
        avg_score: number;
    }>;
}

export interface BenchmarkRun {
    id: number | string;
    title: string;
    status: RunStatus;
    total_cases: number;
    completed_cases: number;
    summary_metrics?: BenchmarkMetricsSummary | null;
    results?: BenchmarkResult[];
    created_at?: string;
    updated_at?: string;
}

export interface ModelOption {
    id: string;
    name: string;
    provider: LlmProviderType;
    context_window: number;
    input_cost_per_1m: number;
    output_cost_per_1m: number;
    supports_json_schema: boolean;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    errors?: Record<string, string[]>;
}
