package database

import (
	"log/slog"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitSqlite() (*gorm.DB, error) {
	dialector := sqlite.Open("./asynqa.db")
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
