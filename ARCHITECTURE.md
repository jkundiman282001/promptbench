# PromptBench Monorepo Architecture

## 1. System Topology

PromptBench is organized as a decoupled monorepo leveraging **npm workspaces** for orchestration, type safety, and parallel service execution.

```
┌─────────────────────────────────────────────────────────────┐
│                      PromptBench Monorepo                   │
│                                                             │
│   ┌─────────────────────┐         ┌─────────────────────┐   │
│   │      apps/web       │         │      apps/api       │   │
│   │   React 19 + TS     │◄───────►│     Laravel 11      │   │
│   │   Tailwind CSS v4   │  REST   │     PHP 8.3 REST    │   │
│   └──────────┬──────────┘         └──────────▲──────────┘   │
│              │                               │              │
│              └───────────────┬───────────────┘              │
│                              ▼                              │
│                    ┌───────────────────┐                    │
│                    │  packages/types   │                    │
│                    │  Shared TS DTOs   │                    │
│                    └───────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Monorepo Workspaces

### `apps/api` (Backend)
- **Framework**: Laravel 11 (PHP 8.3+)
- **Role**: High-performance REST API, domain models, LLM provider integration, queue workers for long-running benchmarks, cost and token telemetry.
- **Routing**: `routes/api.php` for JSON API endpoints, with CORS support and consistent exception mapping.

### `apps/web` (Frontend)
- **Framework**: React 19, TypeScript, Tailwind CSS v4, Vite 6
- **Role**: Single Page Application providing interactive Prompt Studio, Test Suite dataset management, live Multi-Model Matrix execution, and side-by-side telemetry inspection.
- **API Communication**: Configured with Axios and Vite reverse-proxy (`/api` -> `http://127.0.0.1:8000`).

### `packages/types` (Shared Contracts)
- **Role**: Centralized source of truth for domain models, DTOs, request payloads, evaluation criteria, and LLM telemetry shapes shared across frontend, backend contracts, and future CLI tools.

---

## 3. Data Flow & Execution Pipeline

1. **Prompt Definition**: User constructs prompt templates with dynamic `{{variables}}` and parameter controls.
2. **Benchmark Dispatch**: Frontend sends a batch run request to `POST /api/benchmarks/run`.
3. **Execution & Evaluation**: Backend fans out requests to configured LLM drivers (OpenAI, Anthropic, Gemini, Groq, Ollama), captures latency and token counts, executes deterministic (exact/regex/schema) and semantic (LLM-as-a-judge) evaluators.
4. **Telemetry Ingestion**: Results are aggregated, persisted, and visualized in the benchmark matrix view.
