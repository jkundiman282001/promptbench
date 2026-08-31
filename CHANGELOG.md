# Changelog

All notable changes to this project will be documented in this file.
This file is automatically updated by the AI Agent Skill (`document-code-changes`).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased] - 2026-08-31

### Added
- **Monorepo Structure**: Converted project into a clean, decoupled monorepo using npm workspaces (`apps/*`, `packages/*`).
- **`apps/api` (Backend)**: Relocated Laravel 11 application to `apps/api`, configured REST API routing (`routes/api.php`), JSON health and model endpoints, and PHPUnit test suite.
- **`apps/web` (Frontend)**: Created standalone React 19 + TypeScript + Vite 6 + Tailwind CSS v4 SPA with live Prompt Studio, Test Suite manager, and Multi-Model Benchmark Matrix comparison.
- **`packages/types` (Shared Contracts)**: Built shared TypeScript package containing domain models, request DTOs, and metric structures.
- **Root Orchestration**: Added root `package.json` with concurrent dev execution (`npm run dev`), workspace builds (`npm run build`), and service-specific shortcuts (`npm run api`, `npm run web`).

### Changed
- Moved root documentation and configuration (`README.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `CHANGELOG.md`, `.gitignore`) to the repository root.
- Decoupled API endpoints from server-rendered blade templates to standard JSON responses for independent frontend scaling.

### Rationale
- Transitioning to a decoupled monorepo enables independent deployment targets (e.g. Vercel for frontend, Render/Azure/Laravel Cloud for API) while maintaining full type safety and single-command local development.
