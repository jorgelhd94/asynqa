package database

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"gorm.io/gorm/logger"
)

func SlogLevelToGorm(level slog.Level, enabled bool) logger.LogLevel {
	if !enabled {
		return logger.Silent
	}

	switch {
	case level <= slog.LevelDebug:
		return logger.Info // SQL, queries
	case level <= slog.LevelInfo:
		return logger.Info
	case level <= slog.LevelWarn:
		return logger.Warn
	case level <= slog.LevelError:
		return logger.Error
	default:
		return logger.Silent
	}
}

type slogAdapter struct {
	logger *slog.Logger
	level  logger.LogLevel
}

func NewSlogAdapter(l *slog.Logger) logger.Interface {
	return &slogAdapter{
		logger: l,
		level:  logger.Info,
	}
}

func (s *slogAdapter) LogMode(level logger.LogLevel) logger.Interface {
	return &slogAdapter{
		logger: s.logger,
		level:  level,
	}
}

func (s *slogAdapter) Info(ctx context.Context, msg string, args ...any) {
	if s.level >= logger.Info {
		s.logger.InfoContext(ctx, msg, args...)
	}
}

func (s *slogAdapter) Warn(ctx context.Context, msg string, args ...any) {
	if s.level >= logger.Warn {
		s.logger.WarnContext(ctx, msg, args...)
	}
}

func (s *slogAdapter) Error(ctx context.Context, msg string, args ...any) {
	if s.level >= logger.Error {
		s.logger.ErrorContext(ctx, msg, args...)
	}
}

func (s *slogAdapter) Fatal(ctx context.Context, msg string, args ...any) {
	if s.level >= logger.Error {
		s.logger.ErrorContext(ctx, msg, args...)
	}
}

func (s *slogAdapter) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
	if s.level < logger.Info {
		return
	}

	elapsed := time.Since(begin)
	elapsedms := float64(elapsed.Nanoseconds()) / 1e6
	sql, rows := fc()
	if rows == -1 {
		s.logger.DebugContext(ctx, fmt.Sprintf("[%.3fms] [rows:%v] %s", elapsedms, "-", sql))
	} else {
		s.logger.DebugContext(ctx, fmt.Sprintf("[%.3fms] [rows:%v] %s", elapsedms, rows, sql))

	}
}
