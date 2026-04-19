# Contributing to AsynQA

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

1. Install prerequisites:
   - [Go](https://go.dev/) 1.25+
   - [Node.js](https://nodejs.org/) 22+
   - [Wails CLI](https://wails.io/docs/gettingstarted/installation) v2

2. Clone and run:
   ```bash
   git clone https://github.com/jorgelhd94/asynqa.git
   cd asynqa
   wails dev
   ```

3. The app will open with hot-reload for both Go and React.

## Project Conventions

- **Go**: standard library `slog` for logging, flat package structure (no nested subfolders unless there are many files)
- **Frontend**: TanStack Router (file-based routes), TanStack Query for data fetching, shadcn/ui components
- **Styling**: Tailwind CSS v4 — use `text-(--color-var)` syntax (not `text-[var(--color-var)]`), `!` suffix for important (not prefix)
- **UI language**: all user-facing strings must be in English

## Pull Requests

1. Fork the repo and create a branch from `develop`
2. Make your changes
3. Run `wails build` to verify the build succeeds
4. Open a PR against `develop` with a clear description of what and why

## Reporting Issues

Open an issue on GitHub with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- OS and app version
