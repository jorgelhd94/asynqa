# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-04-25

### Added
- Windows installer (NSIS) now lets you choose between installing for **all users** (`Program Files`, requires elevation) or **current user only** (`%LOCALAPPDATA%\Programs`, no admin needed). Per-user installs make the in-app auto-updater work without UAC, since the binary lives in a writable location.
- Optional **Desktop Shortcut** component on the Windows installer (enabled by default, can be unchecked from the Components page).

### Changed
- Auto-updater feedback: success and failure of `Update Now` now surface as toasts. Previously the dialog stayed open silently on success and errors were swallowed entirely.
- A larger **update available** indicator is now shown in the top-right of the Manage Environments screen, in addition to the compact one in the per-environment status bar.

### Fixed
- Long environment names and Redis hosts no longer overflow their containers. Affected views: environments landing list, sidebar environment switcher (header trigger and dropdown items), and saved requests in the Task Runner sidebar. Text truncates with an ellipsis and the full value is shown on hover via a native tooltip.

### Notes
- Upgrading from `v0.0.1`: the previous installer forced an admin-only install in `Program Files`, so the in-app updater cannot replace the binary without elevation. Download the `v0.1.1` installer from the GitHub release page and run it manually. From `v0.1.1` onward, in-app updates will work as long as you choose the per-user install mode.

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

[Unreleased]: https://github.com/jorgelhd94/asynqa/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/jorgelhd94/asynqa/compare/v0.0.1...v0.1.1
[0.0.1]: https://github.com/jorgelhd94/asynqa/releases/tag/v0.0.1
