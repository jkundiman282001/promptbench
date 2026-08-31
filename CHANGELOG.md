# Changelog

All notable changes to this project will be documented in this file.
This file is automatically updated by the AI Agent Skill (`document-code-changes`).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased] - 2026-08-31

### Added
- **Core Domain Migrations & Models (`apps/api`)**: Built schema migrations and Eloquent models for `prompts`, `test_suites`, `test_cases`, `benchmark_runs`, and `benchmark_results` with automated template placeholder rendering and database seeders.
- **Provider-Agnostic LLM Driver Layer (`apps/api`)**: Implemented `LlmDriverInterface` and modular drivers for `OpenAiDriver`, `AnthropicDriver`, `GeminiDriver`, and `GroqDriver` with dry-run fallbacks, latency timers, and token-cost calculators.
- **Evaluation Engine (`apps/api`)**: Developed 4 automated evaluation strategies (`ExactMatchEvaluator`, `RegexEvaluator`, `JsonSchemaEvaluator`, `LlmJudgeEvaluator`) coordinated via `EvaluationPipeline`.
- **Benchmark Orchestration (`apps/api`)**: Created `BenchmarkOrchestratorService` executing parallel matrix runs and calculating aggregate metrics (average latency, total token cost, pass rates, model comparisons).
- **REST API & Feature Tests (`apps/api`)**: Added complete REST API controllers (`PromptController`, `TestSuiteController`, `BenchmarkController`) with 100% test pass rate on `BenchmarkApiTest.php` (6 tests, 43 assertions).
- **Interactive React SPA Frontend (`apps/web`)**: Integrated live backend API client into the Prompt Studio, Test Suite Manager, and Benchmark Matrix with error handling and real-time telemetry rendering.
- **API Documentation (`API.md`)**: Full endpoint specifications covering request/response schemas, error handling, and telemetry payloads.

### Changed
- Converted monolithic scaffold to a decoupled monorepo leveraging npm workspaces for clean separation of backend REST API and React client SPA.

### Rationale
- Provide a robust, production-grade foundation for automated prompt evaluation across multi-model matrices with transparent cost, latency, and quality telemetry.
