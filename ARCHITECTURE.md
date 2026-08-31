# PromptBench Architecture & System Design

## 1. System Overview

PromptBench is an automated evaluation and benchmarking platform designed to test, iterate, and benchmark LLM prompt variants against diverse test cases across multiple LLM providers (OpenAI, Anthropic Claude, Google Gemini, Groq, local Ollama / OpenRouter).

```
┌─────────────────────────────────────────────────────────────┐
│                 React + TypeScript (Inertia)                │
│   Prompt Editor  │  Test Suite Builder  │  Benchmark Matrix │
└──────────────────────────────▲──────────────────────────────┘
                               │ JSON / Props
┌──────────────────────────────▼──────────────────────────────┐
│                    Laravel 11 Application                   │
│   - Controllers (Prompt, TestSuite, BenchmarkRun)           │
│   - Orchestrator Engine (Parallel execution / Queues)       │
│   - Evaluation Engine (Exact Match, Regex, Schema, LLM-Judge)
│   - Cost & Token Telemetry Calculator                       │
└──────────────────────────────▲──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    ┌──────────────────────┐       ┌──────────────────────┐
    │  PostgreSQL / SQLite │       │   LLM API Providers  │
    │  - Prompts & Ver.    │       │   - OpenAI / Anthropic
    │  - Test Cases & Sets │       │   - Gemini / Groq    │
    │  - Benchmark Results │       │   - OpenRouter/Ollama│
    └──────────────────────┘       └──────────────────────┘
```

---

## 2. Core Domain Entities & Data Model

### `prompts`
- `id`: UUID / Bigint
- `title`: String
- `description`: Text (nullable)
- `system_prompt`: Text (nullable)
- `user_template`: Text (e.g. `"Classify this text: {{input_text}}"`)
- `parameters`: JSON (temperature, top_p, max_tokens, stop_sequences)
- `tags`: JSON array

### `test_suites`
- `id`: UUID / Bigint
- `title`: String
- `description`: Text (nullable)

### `test_cases`
- `id`: UUID / Bigint
- `test_suite_id`: Foreign key -> `test_suites.id`
- `variables`: JSON (key-value pairs mapped into prompt template placeholders)
- `expected_output`: Text (nullable, ground truth for exact/semantic matches)
- `expected_schema`: JSON (nullable, JSON schema for structured output validation)

### `benchmark_runs`
- `id`: UUID / Bigint
- `title`: String
- `status`: Enum (`pending`, `running`, `completed`, `failed`)
- `total_cases`: Integer
- `completed_cases`: Integer
- `summary_metrics`: JSON (average latency, total cost, pass rate, win rate)

### `benchmark_results`
- `id`: UUID / Bigint
- `benchmark_run_id`: Foreign key -> `benchmark_runs.id`
- `prompt_id`: Foreign key -> `prompts.id`
- `test_case_id`: Foreign key -> `test_cases.id`
- `provider`: String (`openai`, `anthropic`, `gemini`, `groq`, `openrouter`)
- `model`: String (`gpt-4o`, `claude-3-5-sonnet`, `gemini-2.0-flash`, etc.)
- `rendered_prompt`: Text
- `raw_response`: Text
- `latency_ms`: Float
- `input_tokens`: Integer
- `output_tokens`: Integer
- `estimated_cost_usd`: Decimal(10, 6)
- `eval_scores`: JSON (exact match score, regex score, JSON schema validity, LLM-as-a-judge score & reasoning)
- `status`: Enum (`success`, `error`)
- `error_message`: Text (nullable)

---

## 3. Evaluation Engine Strategies

1. **Deterministic Exact Match**: Case-sensitive / case-insensitive string equality with ground truth.
2. **Regex & Pattern Assertions**: Validates if the output contains or conforms to defined regex patterns.
3. **JSON Schema Validator**: Validates if LLM generated structured output adheres to a strict JSON schema.
4. **LLM-as-a-Judge**: Evaluates outputs on specific rubrics (Accuracy, Completeness, Conciseness, Tone, Hallucination avoidance) from 1 to 5 with chain-of-thought explanation.

---

## 4. Cost & Latency Telemetry

PromptBench tracks real-time token usage and calculates costs based on updated provider pricing matrices:
- Input token price per 1M tokens
- Output token price per 1M tokens
- Network latency + TTFT (Time To First Token) where supported.

---

## 5. Security & Rate-Limiting Controls

- Encrypted API Key storage in environment or secure database credentials.
- Concurrency limiting to prevent LLM rate limit exhaustion (`429 Too Many Requests`).
- Cost circuit-breaker to abort benchmark runs if estimated cost exceeds predefined budget caps.
