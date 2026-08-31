# PromptBench

> **AI Benchmarking & Prompt Evaluation Platform**  
> Built with Laravel 11, Inertia.js, React, TypeScript, and Tailwind CSS.

---

## Overview

PromptBench is an automated evaluation and benchmarking suite for LLM prompts and models. It allows engineering teams to:
- Define and version **prompt templates** with variables and system instructions.
- Create **test suites** with inputs, expected ground truths, and evaluation criteria.
- Execute **benchmarks across multi-model matrices** (OpenAI, Anthropic Claude, Google Gemini, Groq, local Ollama / OpenRouter).
- Measure and compare **quality metrics** (exact match, regex rules, JSON schema validation, LLM-as-a-judge scoring), **latency**, **token consumption**, and **cost**.

---

## Tech Stack

- **Backend:** Laravel 11 (PHP 8.3+)
- **Frontend:** React 19, TypeScript, Inertia.js v2, Tailwind CSS v4, Lucide Icons
- **Database:** PostgreSQL (with zero-config SQLite support for local dev)
- **Tooling:** Vite, Composer, PHPUnit

---

## Prerequisites

- PHP `>= 8.3` (with extensions: `pdo`, `pdo_sqlite`, `pdo_pgsql`, `curl`, `mbstring`, `openssl`)
- Composer `>= 2.8`
- Node.js `>= 20` (Node 24 recommended)
- npm `>= 10`

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Frontend dependencies
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and generate an application key:

```bash
cp .env.example .env
php artisan key:generate
```

Configure your LLM API keys in `.env` as needed:
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
GROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-...
```

### 3. Database Migration

```bash
# Run migrations (defaults to database/database.sqlite or configured PostgreSQL)
php artisan migrate
```

### 4. Running the Development Server

You can run the full development stack using Vite + Laravel:

```bash
# Option A: Run concurrently (Vite dev server + PHP server)
npm run dev
# in a separate terminal:
php artisan serve

# Option B: Build static production assets
npm run build
php artisan serve
```

Access the app at `http://localhost:8000`.

---

## Testing

```bash
php artisan test
```

---

## Project Structure

```
promptbench/
├── app/
│   ├── Http/
│   │   ├── Controllers/       # API & Inertia Controllers
│   │   └── Middleware/        # HandleInertiaRequests middleware
│   ├── Models/                # Eloquent Models (Prompt, TestSuite, BenchmarkRun, etc.)
│   └── Services/              # LLM Providers & Evaluation Engine
├── resources/
│   ├── js/
│   │   ├── Components/        # Reusable UI components
│   │   ├── Pages/             # Inertia Page views (React + TS)
│   │   └── types/             # TypeScript type definitions
│   ├── css/                   # Tailwind CSS styles
│   └── views/
│       └── app.blade.php      # Root Inertia Blade template
├── routes/
│   ├── web.php                # Web routes & Inertia endpoints
│   ├── api.php                # REST API endpoints
│   └── console.php            # Artisan console commands
├── tests/                     # Feature & Unit test suites
├── ARCHITECTURE.md            # System Architecture & Design
├── DECISIONS.md               # Architecture Decision Records (ADR)
└── CHANGELOG.md               # Development Log & Release History
```
