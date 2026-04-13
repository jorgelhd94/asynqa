package worker

import (
	"fmt"
	"time"

	"github.com/hibiken/asynq"
	envstore "github.com/jorgelhd94-tpp/asynqa/internal/environment/store"
	"github.com/jorgelhd94-tpp/asynqa/internal/shared"
)

type WorkerService struct {
	environmentStore *envstore.EnvironmentStore
}

func NewWorkerService(environmentStore *envstore.EnvironmentStore) *WorkerService {
	return &WorkerService{environmentStore: environmentStore}
}

func (s *WorkerService) newInspector(environmentID uint) (*asynq.Inspector, error) {
	env, err := s.environmentStore.FindByID(environmentID)
	if err != nil {
		return nil, fmt.Errorf("environment not found: %w", err)
	}
	return asynq.NewInspector(shared.NewRedisOpts(env)), nil
}

func formatTime(t time.Time) string {
	if t.IsZero() {
		return ""
	}
	return t.Format(time.RFC3339)
}

func (s *WorkerService) GetWorkers(environmentID uint) (WorkersData, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return WorkersData{}, err
	}
	defer inspector.Close()

	servers, err := inspector.Servers()
	if err != nil {
		return WorkersData{}, fmt.Errorf("failed to list servers: %w", err)
	}

	data := WorkersData{}

	for _, srv := range servers {
		var workers []WorkerInfo
		for _, w := range srv.ActiveWorkers {
			workers = append(workers, WorkerInfo{
				TaskID:  w.TaskID,
				Queue:   w.Queue,
				Type:    w.TaskType,
				Payload: string(w.TaskPayload),
				Started: formatTime(w.Started),
			})
		}

		queues := make([]string, 0, len(srv.Queues))
		for q := range srv.Queues {
			queues = append(queues, q)
		}

		data.Servers = append(data.Servers, ServerInfo{
			ID:             srv.ID,
			Host:           srv.Host,
			PID:            srv.PID,
			Queues:         queues,
			StrictPriority: srv.StrictPriority,
			Started:        formatTime(srv.Started),
			Status:         srv.Status,
			Concurrency:    srv.Concurrency,
			ActiveWorkers:  workers,
		})
		data.TotalWorkers += len(workers)
	}

	return data, nil
}
