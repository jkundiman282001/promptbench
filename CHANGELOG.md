# Changelog

All notable changes to this project will be documented in this file.
This file is automatically updated by the AI Agent Skill (`document-code-changes`).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased] - 2026-08-31

### Added
- **Laravel 11 Core Scaffold**: Initialized Laravel 11 framework with PHP 8.3 support, database migrations, and clean application bootstrap.
- **Inertia.js & React Integration**: Configured `inertiajs/inertia-laravel` v3 and `@inertiajs/react` for seamless server-driven Single Page Application architecture.
- **TypeScript Setup**: Added `tsconfig.json` with strict typing, React 19 JSX support, and `@/*` path aliases.
- **Vite & Tailwind CSS v4 Build Pipeline**: Configured modern `@vitejs/plugin-react` and `@tailwindcss/vite` with custom JetBrains Mono and Instrument Sans typography.
- **Inertia Root Layout & Middleware**: Created `resources/views/app.blade.php`, registered `HandleInertiaRequests` middleware in `bootstrap/app.php`, and built initial interactive `Dashboard.tsx` component.
- **Architecture & Scoping Documentation**: Documented system design, technical stack decisions, and operational standards in `README.md`, `ARCHITECTURE.md`, and `DECISIONS.md`.

### Rationale
- Establish a robust, high-performance foundation for PromptBench enabling rapid iteration on prompt evaluation workflows with type-safe React UI and expressive Laravel backend services.
