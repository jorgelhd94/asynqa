package service

import (
	"fmt"
	"time"

	"github.com/hibiken/asynq"
	"github.com/jorgelhd94-tpp/asynqa/internal/dashboard/dto"
	envstore "github.com/jorgelhd94-tpp/asynqa/internal/environment/store"
	"github.com/jorgelhd94-tpp/asynqa/internal/shared"
)

type DashboardService struct {
	environmentStore *envstore.EnvironmentStore
}

func NewDashboardService(environmentStore *envstore.EnvironmentStore) *DashboardService {
	return &DashboardService{environmentStore: environmentStore}
}

func (s *DashboardService) GetDashboard(environmentID uint) (dto.DashboardData, error) {
	env, err := s.environmentStore.FindByID(environmentID)
	if err != nil {
		return dto.DashboardData{}, fmt.Errorf("environment not found: %w", err)
	}

	inspector := asynq.NewInspector(shared.NewRedisOpts(env))
	defer inspector.Close()

	queueNames, err := inspector.Queues()
	if err != nil {
		return dto.DashboardData{}, fmt.Errorf("failed to list queues: %w", err)
	}

	data := dto.DashboardData{}

	for _, name := range queueNames {
		info, err := inspector.GetQueueInfo(name)
		if err != nil {
			continue
		}

		qs := dto.QueueStats{
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

	if len(queueNames) > 0 {
		historyMap := make(map[string]dto.DailyStats)
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
