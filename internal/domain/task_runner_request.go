package domain

import "gorm.io/gorm"

type TaskRunnerRequest struct {
	gorm.Model
	EnvironmentID uint
	Name          string
	Queue         string
	TaskType      string
	Payload       string
	MaxRetry      int
	TimeoutSecs   int64
	DelaySecs     int64
}
