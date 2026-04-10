package services

import (
	"fmt"
	"time"

	"github.com/hibiken/asynq"
	"github.com/jorgelhd94-tpp/asynqa/internal/domain"
	"gorm.io/gorm"
)

type DashboardService struct {
	db *gorm.DB
}

func NewDashboardService(db *gorm.DB) *DashboardService {
	return &DashboardService{db: db}
}

type QueueStats struct {
	Queue          string `json:"queue"`
	Size           int    `json:"size"`
	Pending        int    `json:"pending"`
	Active         int    `json:"active"`
	Scheduled      int    `json:"scheduled"`
	Retry          int    `json:"retry"`
	Archived       int    `json:"archived"`
	Completed      int    `json:"completed"`
	Processed      int    `json:"processed"`
	Failed         int    `json:"failed"`
	ProcessedTotal int    `json:"processedTotal"`
	FailedTotal    int    `json:"failedTotal"`
	LatencyMs      int64  `json:"latencyMs"`
	MemoryUsage    int64  `json:"memoryUsage"`
	Paused         bool   `json:"paused"`
}

type DailyStats struct {
	Date      string `json:"date"`
	Processed int    `json:"processed"`
	Failed    int    `json:"failed"`
}

type DashboardData struct {
	Queues       []QueueStats `json:"queues"`
	TotalTasks   int          `json:"totalTasks"`
	TotalPending int          `json:"totalPending"`
	TotalActive  int          `json:"totalActive"`
	TotalFailed  int          `json:"totalFailed"`
	History      []DailyStats `json:"history"`
	ServerCount  int          `json:"serverCount"`
}

func (s *DashboardService) GetDashboard(environmentID uint) (DashboardData, error) {
	var env domain.Environment
	if err := s.db.First(&env, environmentID).Error; err != nil {
		return DashboardData{}, fmt.Errorf("environment not found: %w", err)
	}

	inspector := asynq.NewInspector(newRedisOpts(env))
	defer inspector.Close()

	queueNames, err := inspector.Queues()
	if err != nil {
		return DashboardData{}, fmt.Errorf("failed to list queues: %w", err)
	}

	data := DashboardData{}

	for _, name := range queueNames {
		info, err := inspector.GetQueueInfo(name)
		if err != nil {
			continue
		}

		qs := QueueStats{
			Queue:          info.Queue,
			Size:           info.Size,
			Pending:        info.Pending,
			Active:         info.Active,
			Scheduled:      info.Scheduled,
			Retry:          info.Retry,
			Archived:       info.Archived,
			Completed:      info.Completed,
			Processed:      info.Processed,
			Failed:         info.Failed,
			ProcessedTotal: info.ProcessedTotal,
			FailedTotal:    info.FailedTotal,
			LatencyMs:      info.Latency.Milliseconds(),
			MemoryUsage:    info.MemoryUsage,
			Paused:         info.Paused,
		}

		data.Queues = append(data.Queues, qs)
		data.TotalTasks += info.Size
		data.TotalPending += info.Pending
		data.TotalActive += info.Active
		data.TotalFailed += info.FailedTotal
	}

	// Aggregate history from the first queue (or all queues)
	if len(queueNames) > 0 {
		historyMap := make(map[string]DailyStats)
		for _, name := range queueNames {
			history, err := inspector.History(name, 14)
			if err != nil {
				continue
			}
			for _, h := range history {
				dateStr := h.Date.Format(time.DateOnly)
				entry := historyMap[dateStr]
				entry.Date = dateStr
				entry.Processed += h.Processed
				entry.Failed += h.Failed
				historyMap[dateStr] = entry
			}
		}
		for _, v := range historyMap {
			data.History = append(data.History, v)
		}
	}

	servers, err := inspector.Servers()
	if err == nil {
		data.ServerCount = len(servers)
	}

	return data, nil
}
