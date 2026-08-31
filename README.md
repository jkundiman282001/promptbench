# PromptBench Monorepo

> **AI Benchmarking & Prompt Evaluation Platform**  
> Decoupled Full-Stack Architecture: Laravel 11 REST API (`apps/api`), React 19 + TypeScript SPA (`apps/web`), and Shared Contracts (`packages/types`).

---

## Workspace Structure

```
promptbench/
├── apps/
│   ├── api/                   # Laravel 11 Backend (PHP 8.3 REST API)
│   │   ├── app/
│   │   ├── routes/api.php     # REST API routes
│   │   └── database/          # Migrations & Seeders
│   │
│   └── web/                   # Frontend SPA (React 19, TypeScript, Tailwind CSS v4, Vite)
│       ├── src/
│       │   ├── App.tsx        # Benchmark Studio & Dashboard
│       │   └── services/api.ts# Axios API client to backend
│       └── vite.config.ts     # Dev server proxying /api to http://127.0.0.1:8000
│
├── packages/
│   └── types/                 # Shared TypeScript domain types & API contracts
│       └── src/index.ts       # Type definitions for Prompts, TestSuites, Benchmarks
│
├── ARCHITECTURE.md            # System Architecture & Monorepo Blueprint
├── DECISIONS.md               # Architecture Decision Records (ADR)
└── CHANGELOG.md               # Monorepo Development Changelog
```

---

## Quick Start

### 1. Prerequisites

- **Node.js**: `>= 20.x` (v24 recommended)
- **PHP**: `>= 8.3` (with `pdo`, `pdo_sqlite`, `curl`, `mbstring`)
- **Composer**: `>= 2.8`

### 2. Installation

From the monorepo root:

```bash
# Install root & workspace npm packages
npm install

# Install Laravel PHP dependencies
cd apps/api && composer install && cp .env.example .env && php artisan key:generate && cd ../..
```

### 3. Run Development Environment

Run both the Laravel backend and React frontend concurrently with one command from the monorepo root:

```bash
npm run dev
```

- **Web Frontend:** `http://localhost:5173`
- **Backend REST API:** `http://localhost:8000` (proxied automatically via Vite)

---

## Individual Service Scripts

Run tasks for specific workspaces from the root:

```bash
# Start frontend only
npm run web

# Start backend only
npm run api

# Build all workspaces
npm run build

# Run tests across workspaces
npm run test
```

---

## Testing & CI

```bash
# Backend tests
cd apps/api && php artisan test

# Frontend type checking
npm run build --workspace=@promptbench/web
```
