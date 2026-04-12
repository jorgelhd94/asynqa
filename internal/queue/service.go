package queue

import (
	"fmt"

	"github.com/hibiken/asynq"
	envstore "github.com/jorgelhd94-tpp/asynqa/internal/environment/store"
	"github.com/jorgelhd94-tpp/asynqa/internal/shared"
)

type QueueService struct {
	environmentStore *envstore.EnvironmentStore
}

func NewQueueService(environmentStore *envstore.EnvironmentStore) *QueueService {
	return &QueueService{environmentStore: environmentStore}
}

func (s *QueueService) newInspector(environmentID uint) (*asynq.Inspector, error) {
	env, err := s.environmentStore.FindByID(environmentID)
	if err != nil {
		return nil, fmt.Errorf("environment not found: %w", err)
	}
	return asynq.NewInspector(shared.NewRedisOpts(env)), nil
}

func (s *QueueService) GetQueues(environmentID uint) (QueuesData, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return QueuesData{}, err
	}
	defer inspector.Close()

	queueNames, err := inspector.Queues()
	if err != nil {
		return QueuesData{}, fmt.Errorf("failed to list queues: %w", err)
	}

	data := QueuesData{
		TotalQueues: len(queueNames),
	}

	for _, name := range queueNames {
		info, err := inspector.GetQueueInfo(name)
		if err != nil {
			continue
		}

		qi := QueueInfo{
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

		data.Queues = append(data.Queues, qi)
		data.TotalTasks += info.Size

		if info.Paused {
			data.PausedQueues++
		} else {
			data.ActiveQueues++
		}
	}

	return data, nil
}

func (s *QueueService) PauseQueue(environmentID uint, queueName string) error {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return err
	}
	defer inspector.Close()

	if err := inspector.PauseQueue(queueName); err != nil {
		return fmt.Errorf("failed to pause queue %q: %w", queueName, err)
	}
	return nil
}

func (s *QueueService) UnpauseQueue(environmentID uint, queueName string) error {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return err
	}
	defer inspector.Close()

	if err := inspector.UnpauseQueue(queueName); err != nil {
		return fmt.Errorf("failed to unpause queue %q: %w", queueName, err)
	}
	return nil
}

func (s *QueueService) DeleteQueue(environmentID uint, queueName string, force bool) error {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return err
	}
	defer inspector.Close()

	if err := inspector.DeleteQueue(queueName, force); err != nil {
		return fmt.Errorf("failed to delete queue %q: %w", queueName, err)
	}
	return nil
}
