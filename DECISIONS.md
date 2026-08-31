# Architecture Decision Records (ADR) & Decision Log

## ADR 001: Hybrid Database Strategy (SQLite for Local Development, PostgreSQL for Production)
- **Status:** Accepted
- **Context:** We need instantaneous local setup without requiring container dependencies or complex local DB setup while ensuring seamless deployment to PostgreSQL (Neon, Render, Supabase, Azure).
- **Decision:** Default to SQLite (`database/database.sqlite`) locally with full PostgreSQL compatibility and zero raw SQLite-specific SQL syntax. PostgreSQL connection settings (`DB_CONNECTION=pgsql` or `DATABASE_URL`) are pre-configured.
- **Consequences:** Easy onboarding for any contributor with no prerequisites beyond PHP and Node; identical schema migrations run seamlessly on production PostgreSQL.

## ADR 002: Inertia.js with React & TypeScript
- **Status:** Accepted
- **Context:** We need a responsive, highly interactive modern UI for real-time prompt editing, matrix comparisons, and benchmark telemetry without the complexity of managing a detached microservice API and separate authentication/CORS tokens.
- **Decision:** Use Inertia.js v2 with React 19, TypeScript, and Tailwind CSS v4.
- **Consequences:** Single-repository developer ergonomics, full server-side validation and security with client-side SPA speed and type safety.

## ADR 003: Provider-Agnostic LLM Driver Architecture
- **Status:** Accepted
- **Context:** Benchmarking requires executing identical prompts across OpenAI, Anthropic, Gemini, Groq, and local/OpenRouter endpoints with normalized response shapes (tokens, cost, latency, content).
- **Decision:** Implement a `LlmClientInterface` with modular drivers for each provider, normalizing responses into a unified `LlmCompletionResponse` DTO.
- **Consequences:** Adding a new provider or custom local endpoint takes only a single driver class without touching evaluation or orchestration logic.
