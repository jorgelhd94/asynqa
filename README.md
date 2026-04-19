# AsynQA

A cross-platform desktop application for managing, monitoring, and inspecting [asynq](https://github.com/hibiken/asynq) task queues backed by Redis. Built with [Wails v2](https://wails.io/) for Go developers.

> **Note:** AsynQA is designed specifically for Go/asynq workflows — it is not a general-purpose Redis client.

<img width="1365" height="720" alt="1" src="https://github.com/user-attachments/assets/32bc630f-e1f7-44d8-8e9d-a56c9dd68e4f" />

## Features

- **Dashboard** — real-time overview of queues, tasks, and workers
- **Queue Management** — browse queues, pause/unpause, view task breakdowns by state
- **Task Inspector** — view task details, payloads, retry info; run, archive, or delete tasks
- **Task Runner** — compose and enqueue tasks with a built-in JSON editor (syntax highlighting, prettify)
- **Saved Requests** — save, clone, and organize task runner requests
- **Workers & Schedulers** — monitor active workers and scheduler entries
- **Redis Info** — raw Redis server information
- **Auto-Update** — checks GitHub Releases for new versions

## Requirements

- [Go](https://go.dev/) 1.25+
- [Node.js](https://nodejs.org/) 22+
- [Wails CLI](https://wails.io/docs/gettingstarted/installation) v2
- A running Redis instance (for connecting to asynq queues)

### Platform-specific

- **Windows**: No additional dependencies
- **Linux**: `libgtk-3-dev`, `libwebkit2gtk-4.0-dev`
- **macOS**: Xcode Command Line Tools

## Getting Started

```bash
# Clone the repository
git clone https://github.com/jorgelhd94/asynqa.git
cd asynqa

# Run in development mode (hot-reload)
wails dev

# Build for production
wails build
```

The production binary will be in `build/bin/`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Go 1.25, Wails v2, GORM + SQLite |
| Frontend | React 19, TypeScript, Vite 7, TanStack Router & Query |
| Styling | Tailwind CSS v4, shadcn/ui |
| Editor | CodeMirror 6 (JSON syntax highlighting) |

## Project Structure

```
asynqa/
  main.go                  # Wails app entry point
  internal/                # Backend services and domain models
    dashboard/             # Dashboard aggregation
    environment/           # Redis environment management
    queue/                 # Queue operations (via asynq inspector)
    taskrunner/            # Task runner (enqueue + saved requests)
    updater/               # Auto-update via GitHub Releases
    worker/                # Worker monitoring
    scheduler/             # Scheduler entries and events
    redis/                 # Raw Redis info
    domain/                # GORM models
    shared/                # Shared utilities
  infrastructure/
    database/              # SQLite setup and migrations
  frontend/
    src/
      routes/              # TanStack Router file-based routes
      components/          # React components (ui/, environment/, task-runner/)
      hooks/               # TanStack Query hooks
    wailsjs/               # Auto-generated Wails bindings (do not edit)
  .github/workflows/       # CI/CD (cross-platform release builds)
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

[MIT](LICENSE)
