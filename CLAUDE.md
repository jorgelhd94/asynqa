# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Asynqa is a cross-platform desktop application for developers who use the [asynq](https://github.com/hibiken/asynq) library in Go. It provides a visual interface to manage, monitor, and inspect asynq task queues backed by Redis. The app is built with **Wails v3** (Go backend + embedded web frontend) and is specifically designed for Go/asynq workflows — it is not a general-purpose Redis client.

## Tech Stack

- **Backend**: Go 1.25, Wails v3 (alpha 72), GORM + SQLite
- **Frontend**: React 19, TypeScript, Vite 7, TanStack Router (file-based routing), TanStack Query
- **Styling**: Tailwind CSS v4, shadcn/ui (new-york style, zinc base color)
- **Build**: Taskfile (task runner), platform-specific Taskfiles in `build/`

## Commands

```bash
# Development (hot-reload for both frontend and backend)
wails3 dev

# Build for current OS
task build

# Run built binary
task run

# Server mode (HTTP, no GUI)
task build:server
task run:server

# Frontend only (from frontend/ directory)
npm run dev
npm run build
```

## Architecture

### Backend (Go)

- `main.go` — Wails app entry point: initializes DB, binds services, creates window
- `greetservice.go` — Example bound service (methods callable from frontend via generated bindings)
- `internal/domain/` — Domain models (e.g., `Environment` struct with GORM tags)
- `infrastructure/database/` — SQLite setup (`sqlite.go`), seed data (`seeds.go`), custom GORM-slog logger adapter (`logger.go`)

Services are registered in `main.go` via `application.ServiceOptions` and exposed to the frontend through Wails bindings.

### Frontend (React/TypeScript)

- `frontend/src/main.tsx` — App entry with router and query client setup
- `frontend/src/routes/` — TanStack Router file-based routes (auto-generates `routeTree.gen.ts`)
- `frontend/src/components/ui/` — shadcn/ui base components
- `frontend/src/components/environments/` — Feature-specific components
- `frontend/bindings/` — Auto-generated Wails bindings (Go ↔ JS bridge). Do not edit manually.

### Wails Bindings

Backend Go methods are exposed to the frontend via auto-generated TypeScript bindings in `frontend/bindings/`. After changing a bound service's exported methods, run `wails3 dev` or rebuild to regenerate bindings.

### Database

SQLite database (`asynqa.db`) using GORM with auto-migration. Models are defined in `internal/domain/` and migrated in `infrastructure/database/sqlite.go`.

## Key Conventions

- Path alias `@/*` maps to `frontend/src/*` in TypeScript imports
- shadcn/ui components are added via `npx shadcn@latest add <component>` (configured in `frontend/components.json`)
- Frontend assets are embedded into the Go binary via `go:embed frontend/dist`
- Structured logging uses Go's `slog` package with a custom GORM adapter
