# AsynQA

A cross-platform desktop application for developers who use the [asynq](https://github.com/hibiken/asynq) library in Go. Built with [Wails v2](https://wails.io/) (Go backend + embedded web frontend).

## Getting Started

1. Navigate to your project directory in the terminal.

2. To run your application in development mode:

   ```
   wails dev
   ```

   This will start your application and enable hot-reloading for both frontend and backend changes.

3. To build your application for production:

   ```
   wails build
   ```

   This will create a production-ready executable in the `build/bin` directory.

## Project Structure

- `frontend/` — React frontend (TypeScript, Vite, TanStack Router)
- `main.go` — Wails app entry point and service binding
- `internal/` — Domain models and business logic services
- `infrastructure/` — Database setup and migrations
- `wails.json` — Wails project configuration

## Resources

- [Wails Documentation](https://wails.io/docs/introduction)
- [Wails Discord](https://discord.gg/JDdSxwjhGf)
- [Wails GitHub Discussions](https://github.com/wailsapp/wails/discussions)
