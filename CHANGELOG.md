# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-04-25

### Fixed
- Long environment names and Redis hosts no longer overflow their containers. Affected views: environments landing list, sidebar environment switcher (header trigger and dropdown items), and saved requests in the Task Runner sidebar. Text now truncates with an ellipsis and the full value is shown on hover via a native tooltip.

## [0.0.1] - Initial release

### Added
- Dashboard with aggregated real-time view of queues, tasks, and workers.
- Queue management: list, pause/unpause, and per-state task breakdown.
- Task Inspector: payload, retry info, run/archive/delete actions.
- Task Runner: compose and enqueue tasks with an integrated JSON editor (CodeMirror 6, syntax highlighting, prettify).
- Saved Requests: save, clone, and organize Task Runner requests (persisted in SQLite).
- Workers and Schedulers monitoring views.
- Redis Info: raw server info from the connected Redis instance.
- Environments: manage multiple Redis/asynq connections.
- Auto-Updater: checks GitHub Releases for new versions (via `creativeprojects/go-selfupdate`).

[Unreleased]: https://github.com/jorgelhd94/asynqa/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/jorgelhd94/asynqa/compare/v0.0.1...v0.2.0
[0.0.1]: https://github.com/jorgelhd94/asynqa/releases/tag/v0.0.1
