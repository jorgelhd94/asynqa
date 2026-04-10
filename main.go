package main

import (
	"embed"
	"log"
	"log/slog"
	"os"
	"strings"

	"github.com/jorgelhd94-tpp/asynqa/infrastructure/database"
	"github.com/jorgelhd94-tpp/asynqa/internal/services"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

const appName = "AsynQA"

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

	envService := services.NewEnvironmentService(db)
	dashboardService := services.NewDashboardService(db)

	app := application.New(application.Options{
		Name:        strings.ToLower(appName),
		Description: "Desktop tool for managing asynq task queues",
		Services: []application.Service{
			application.NewService(envService),
			application.NewService(dashboardService),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title: appName,
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 50,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		BackgroundColour: application.NewRGB(27, 38, 54),
		URL:              "/",
		StartState:       application.WindowStateMaximised,
		MinWidth:         800,
		MinHeight:        600,
	})

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
