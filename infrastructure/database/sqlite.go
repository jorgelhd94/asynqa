package database

import (
	"fmt"
	"log/slog"
	"os"
	"path/filepath"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func dbPath() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", fmt.Errorf("cannot resolve config directory: %w", err)
	}
	dir := filepath.Join(configDir, "AsynQA")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", fmt.Errorf("cannot create data directory: %w", err)
	}
	return filepath.Join(dir, "asynqa.db"), nil
}

func InitSqlite() (*gorm.DB, error) {
	path, err := dbPath()
	if err != nil {
		return nil, err
	}
	slog.Info("database path", "path", path)
	dialector := sqlite.Open(path)
	gormLevel := SlogLevelToGorm(slog.LevelInfo, true)
	logger := NewSlogAdapter(slog.Default()).LogMode(gormLevel)

	db, err := gorm.Open(dialector, &gorm.Config{
		Logger:         logger,
		TranslateError: false,
	})

	if err != nil {
		return nil, err
	}

	if err := Automigrate(db); err != nil {
		return nil, err
	}

	return db, nil
}
