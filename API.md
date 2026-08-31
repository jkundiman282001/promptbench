# PromptBench REST API Documentation

Base URL: `http://localhost:8000/api` (or proxied via `http://localhost:5173/api`)

---

## 1. System Health

### `GET /api/health`
Returns system status and timestamp.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "promptbench-api",
  "timestamp": "2026-08-31T11:20:00+00:00"
}
```

---

## 2. Models Catalog

### `GET /api/models`
Returns list of supported LLM models with pricing and context specifications.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o",
      "provider": "openai",
      "context_window": 128000,
      "input_cost_per_1m": 2.50,
      "output_cost_per_1m": 10.00,
      "supports_json_schema": true
    },
    {
      "id": "claude-3-5-sonnet",
      "name": "Claude 3.5 Sonnet",
      "provider": "anthropic",
      "context_window": 200000,
      "input_cost_per_1m": 3.00,
      "output_cost_per_1m": 15.00,
      "supports_json_schema": true
    },
    {
      "id": "gemini-2.0-flash",
      "name": "Gemini 2.0 Flash",
      "provider": "gemini",
      "context_window": 1048576,
      "input_cost_per_1m": 0.10,
      "output_cost_per_1m": 0.40,
      "supports_json_schema": true
    }
  ]
}
```

---

## 3. Prompts API

### `GET /api/prompts`
List all prompt templates.

### `POST /api/prompts`
Create a new prompt template.

**Request Body:**
```json
{
  "title": "Customer Support Classifier",
  "description": "Zero-shot classification prompt",
  "system_prompt": "You are a customer support triage assistant.",
  "user_template": "Classify message: {{message}}\nOutput format: JSON",
  "parameters": {
    "temperature": 0.0,
    "max_tokens": 200,
    "response_format": "json_object"
  },
  "tags": ["classification", "production"]
}
```

### `PUT /api/prompts/{id}`
Update an existing prompt template.

### `DELETE /api/prompts/{id}`
Delete a prompt template.

---

## 4. Test Suites API

### `GET /api/test-suites`
List all test suites with associated test cases.

### `POST /api/test-suites`
Create a new test suite.

**Request Body:**
```json
{
  "title": "Billing Edge Cases",
  "description": "Disputes, refund requests, and invoice errors"
}
```

### `POST /api/test-suites/{id}/cases`
Add a test case to a test suite.

**Request Body:**
```json
{
  "name": "Double charge dispute",
  "variables": {
    "message": "I was charged twice $499 on my Visa card this morning!"
  },
  "expected_output": "billing",
  "expected_schema": {
    "type": "object",
    "required": ["department", "urgency"]
  }
}
```

---

## 5. Benchmarks & Telemetry API

### `GET /api/benchmarks`
List all past benchmark runs with aggregated summary metrics.

### `POST /api/benchmarks/run`
Execute a matrix benchmark run across prompt variants, test suites, and model choices.

**Request Body:**
```json
{
  "title": "Classification Multi-Model Stress Test",
  "prompt_ids": [1, 2],
  "test_suite_id": 1,
  "model_ids": ["gpt-4o", "gemini-2.0-flash", "claude-3-5-sonnet"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Classification Multi-Model Stress Test",
    "status": "completed",
    "total_cases": 6,
    "completed_cases": 6,
    "summary_metrics": {
      "total_runs": 6,
      "avg_latency_ms": 284.5,
      "total_cost_usd": 0.00312,
      "total_input_tokens": 1640,
      "total_output_tokens": 580,
      "pass_rate_percentage": 100,
      "model_comparisons": {
        "gemini-2.0-flash": {
          "model": "gemini-2.0-flash",
          "provider": "gemini",
          "avg_latency_ms": 195.2,
          "total_cost_usd": 0.00018,
          "pass_rate": 100
        }
      }
    },
    "results": [
      {
        "id": 1,
        "model": "gemini-2.0-flash",
        "provider": "gemini",
        "rendered_prompt": "Classify message: ...",
        "raw_response": "{\"department\": \"billing\", \"urgency\": \"high\"}",
        "latency_ms": 182.4,
        "input_tokens": 132,
        "output_tokens": 34,
        "estimated_cost_usd": 0.000027,
        "eval_scores": {
          "exact_match": { "strategy": "exact_match", "score": 1.0, "passed": true },
          "json_schema": { "strategy": "json_schema", "score": 1.0, "passed": true },
          "llm_judge": { "strategy": "llm_judge", "score": 5.0, "passed": true }
        }
      }
    ]
  }
}
```

### `GET /api/benchmarks/{id}`
Retrieve a specific benchmark run with full individual test execution traces.
