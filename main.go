package main

import (
	"context"
	"embed"
	"log"
	"log/slog"
	"os"

	"github.com/jorgelhd94-tpp/asynqa/infrastructure/database"
	dashservice "github.com/jorgelhd94-tpp/asynqa/internal/dashboard"
	env "github.com/jorgelhd94-tpp/asynqa/internal/environment"
	queuepkg "github.com/jorgelhd94-tpp/asynqa/internal/queue"
	redispkg "github.com/jorgelhd94-tpp/asynqa/internal/redis"
	"github.com/jorgelhd94-tpp/asynqa/internal/scheduler"
	"github.com/jorgelhd94-tpp/asynqa/internal/taskrunner"
	"github.com/jorgelhd94-tpp/asynqa/internal/updater"
	"github.com/jorgelhd94-tpp/asynqa/internal/worker"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

//go:embed all:frontend/dist
var assets embed.FS

const appName = "AsynQA"

var version = "dev"

func initLogger() {
	opts := &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}
	handler := slog.NewTextHandler(os.Stdout, opts)
	slog.SetDefault(slog.New(handler))
}

func main() {
	initLogger()

	db, err := database.InitSqlite()
	if err != nil {
		log.Fatalf("Error starting DB: %s", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Error getting underlying DB: %s", err)
	}
	defer sqlDB.Close()

	// Stores
	environmentStore := env.NewEnvironmentStore(db)

	// Services
	environmentService := env.NewEnvironmentService(environmentStore)
	dashboardService := dashservice.NewDashboardService(environmentStore)
	queueService := queuepkg.NewQueueService(environmentStore)
	workerService := worker.NewWorkerService(environmentStore)
	schedulerService := scheduler.NewSchedulerService(environmentStore)
	redisService := redispkg.NewRedisService(environmentStore)
	requestStore := taskrunner.NewTaskRunnerRequestStore(db)
	taskRunnerService := taskrunner.NewTaskRunnerService(environmentStore, requestStore)
	updaterService := updater.NewUpdaterService(version)

	err = wails.Run(&options.App{
		Title:            appName,
		Width:            1024,
		Height:           768,
		MinWidth:         800,
		MinHeight:        600,
		WindowStartState: options.Maximised,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        func(_ context.Context) {},
		Mac: &mac.Options{
			TitleBar:             mac.TitleBarHiddenInset(),
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			About: &mac.AboutInfo{
				Title:   appName,
				Message: "Desktop tool for managing asynq task queues",
			},
		},
		Bind: []any{
			environmentService,
			dashboardService,
			queueService,
			workerService,
			schedulerService,
			redisService,
			taskRunnerService,
			updaterService,
		},
	})

	if err != nil {
		log.Fatal(err)
	}
}
