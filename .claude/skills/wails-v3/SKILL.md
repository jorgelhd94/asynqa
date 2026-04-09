# Wails v3 Expert Skill

You are an expert in **Wails v3** (alpha), the Go framework for building cross-platform desktop applications with web frontends. This skill covers installation, project structure, services, bindings, events, windows, and CLI commands.

## Installation

### Prerequisites
- Go 1.23+ (project uses Go 1.25)
- Node.js 18+ (for frontend tooling)
- Platform-specific dependencies:
  - **Windows**: WebView2 runtime (included in Windows 11, install via Evergreen Bootstrapper on Windows 10)
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Linux**: `libgtk-3-dev`, `libwebkit2gtk-4.0-dev` (or GTK4/WebKitGTK 6.0 equivalents)

### Install CLI
```bash
go install github.com/wailsapp/wails/v3/cmd/wails3@latest
```

To install a specific alpha version:
```bash
go install github.com/wailsapp/wails/v3/cmd/wails3@v3.0.0-alpha.74
```

### Create a New Project
```bash
wails3 init -n myapp -t react-ts
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `wails3 dev` | Development mode with hot-reload (frontend + backend) |
| `wails3 generate bindings` | Generate frontend bindings from Go services |
| `wails3 generate bindings -clean` | Clean and regenerate all bindings |
| `wails3 generate icon -input myicon.png` | Generate app icons for all platforms |
| `wails3 generate syso` | Generate Windows resource files (.syso) |
| `wails3 generate defaults` | Generate all default assets and resources |
| `wails3 task <taskname>` | Run tasks defined in Taskfile.yml |

## Application Entry Point

The application is initialized in `main.go` with `application.New()`:

```go
package main

import (
    "embed"
    "log"

    "github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
    app := application.New(application.Options{
        Name:        "myapp",
        Description: "My Wails v3 App",
        Services: []application.Service{
            application.NewService(&MyService{}),
        },
        Assets: application.AssetOptions{
            Handler: application.AssetFileServerFS(assets),
        },
        Mac: application.MacOptions{
            ApplicationShouldTerminateAfterLastWindowClosed: true,
        },
    })

    app.Window.NewWithOptions(application.WebviewWindowOptions{
        Title:     "My App",
        URL:       "/",
        MinWidth:  800,
        MinHeight: 600,
    })

    if err := app.Run(); err != nil {
        log.Fatal(err)
    }
}
```

### Asset Servers
- `application.AssetFileServerFS(assets)` - Serves from embedded filesystem (production)
- `application.BundledAssetFileServer(assets)` - Alternative for bundled assets

## Services

Services are Go structs whose exported methods become callable from the frontend via auto-generated bindings.

### Defining a Service
```go
type EnvironmentService struct {
    db *gorm.DB
}

// Exported methods are exposed to the frontend
func (s *EnvironmentService) GetAll() ([]Environment, error) {
    var envs []Environment
    result := s.db.Find(&envs)
    return envs, result.Error
}

func (s *EnvironmentService) Create(env Environment) (*Environment, error) {
    result := s.db.Create(&env)
    return &env, result.Error
}
```

### Registering Services
```go
app := application.New(application.Options{
    Services: []application.Service{
        application.NewService(&EnvironmentService{db: db}),
        application.NewService(&QueueService{db: db}),
    },
})
```

### Service Lifecycle Hooks
Services can implement lifecycle interfaces:
- `OnStartup()` - Called when the application starts
- `OnShutdown()` - Called when the application is closing

## Bindings

Bindings are auto-generated TypeScript code that bridges Go services to the frontend.

### How It Works
1. Define exported methods on registered service structs
2. Run `wails3 dev` or `wails3 generate bindings` to generate TypeScript bindings
3. Bindings appear in `frontend/bindings/` directory
4. Frontend imports and calls them like regular async functions

### Frontend Usage
```typescript
// Auto-generated bindings - do NOT edit manually
import { GetAll, Create } from '../bindings/github.com/user/app/environmentservice';

// Call Go methods from frontend
const environments = await GetAll();
const newEnv = await Create({ name: "Production", host: "redis.prod.com" });
```

### Key Points
- Bindings use `wails.CallByID` internally (most robust method)
- Only **exported** methods on **registered** service structs are exposed
- Regenerate bindings after changing service method signatures
- Never manually edit files in `frontend/bindings/`
- The binding generator is a static analyzer that parses Go code

## Events

Wails v3 has a typed event system for communication between Go and frontend.

### Registering Custom Events (in init())
```go
func init() {
    // Register typed events for binding generation
    application.RegisterEvent[string]("time")
    application.RegisterEvent[MyData]("data-updated")
}
```

### Emitting Events (Go)
```go
// From application level
app.Event.Emit("myevent", data)

// Emit from a goroutine
go func() {
    for {
        app.Event.Emit("time", time.Now().Format(time.RFC1123))
        time.Sleep(time.Second)
    }
}()
```

### Listening to Events (Go)
```go
app.Event.On("myevent", func(e *application.CustomEvent) {
    log.Printf("Received: %v", e.Data)
})
```

### Application Events
```go
import "github.com/wailsapp/wails/v3/pkg/events"

app.Event.OnApplicationEvent(events.Common.ApplicationStarted, func(event *application.ApplicationEvent) {
    // App has started
})

app.Event.OnApplicationEvent(events.Common.ThemeChanged, func(event *application.ApplicationEvent) {
    if event.Context().IsDarkMode() {
        // Handle dark mode
    }
})
```

### Window Events and Hooks
```go
win := app.Window.NewWithOptions(...)

// Hooks can cancel events
win.RegisterHook(events.Common.WindowClosing, func(e *application.WindowEvent) {
    if !canClose {
        e.Cancel() // Prevent window from closing
    }
})
```

## Windows

### Creating Windows
```go
win := app.Window.NewWithOptions(application.WebviewWindowOptions{
    Title:            "My Window",
    Name:             "main",
    URL:              "/",
    Width:            1024,
    Height:           768,
    MinWidth:         800,
    MinHeight:        600,
    BackgroundColour: application.NewRGB(27, 38, 54),
    StartState:       application.WindowStateMaximised,
    DevToolsEnabled:  true,
    Mac: application.MacWindow{
        InvisibleTitleBarHeight: 50,
        Backdrop:                application.MacBackdropTranslucent,
        TitleBar:                application.MacTitleBarHiddenInset,
    },
})
```

### Window States
- `application.WindowStateNormal`
- `application.WindowStateMaximised`
- `application.WindowStateMinimised`
- `application.WindowStateFullscreen`

## Project Structure (React + TypeScript template)

```
myapp/
  main.go                    # Wails app entry point
  myservice.go               # Bound services
  internal/                  # Internal packages
  frontend/
    bindings/                # Auto-generated (DO NOT EDIT)
    src/
      main.tsx               # React entry
      routes/                # TanStack Router file-based routes
      components/            # React components
    package.json
    vite.config.ts
  build/                     # Platform-specific build configs
  Taskfile.yml               # Task runner config
  go.mod
```

## Updating Wails v3 Alpha

To update to the latest alpha:
```bash
# Update CLI
go install github.com/wailsapp/wails/v3/cmd/wails3@latest

# Update Go module dependency
go get github.com/wailsapp/wails/v3@latest
go mod tidy
```

To update to a specific version:
```bash
go install github.com/wailsapp/wails/v3/cmd/wails3@v3.0.0-alpha.74
go get github.com/wailsapp/wails/v3@v3.0.0-alpha.74
go mod tidy
```

## Common Patterns

### Server Mode (no GUI, HTTP only)
Wails v3 supports running as an HTTP server without a native window — useful for development or headless environments. Configure via Taskfile with `task build:server` / `task run:server`.

### Embedding Frontend
Frontend assets are compiled and embedded into the Go binary:
```go
//go:embed all:frontend/dist
var assets embed.FS
```

### Context Cancellation
Use `app.Context()` for clean shutdown in goroutines:
```go
go func() {
    select {
    case <-ticker.C:
        // do work
    case <-app.Context().Done():
        return
    }
}()
```

## Important Notes

- Wails v3 is **alpha software** — APIs may change between releases
- The binding generator is still a work in progress
- Always check release notes before upgrading alpha versions
- Nightly releases are automated from the v3-alpha branch
- Multi-window support is a key v3 feature over v2
- System tray support is available
