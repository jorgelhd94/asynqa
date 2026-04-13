package taskrunner

import (
	"fmt"
	"time"

	"github.com/hibiken/asynq"
	envstore "github.com/jorgelhd94-tpp/asynqa/internal/environment/store"
	"github.com/jorgelhd94-tpp/asynqa/internal/shared"
)

type TaskRunnerService struct {
	environmentStore *envstore.EnvironmentStore
}

func NewTaskRunnerService(environmentStore *envstore.EnvironmentStore) *TaskRunnerService {
	return &TaskRunnerService{environmentStore: environmentStore}
}

func (s *TaskRunnerService) EnqueueTask(environmentID uint, request EnqueueRequest) (EnqueueResult, error) {
	env, err := s.environmentStore.FindByID(environmentID)
	if err != nil {
		return EnqueueResult{}, fmt.Errorf("environment not found: %w", err)
	}

	client := asynq.NewClient(shared.NewRedisOpts(env))
	defer client.Close()

	task := asynq.NewTask(request.TaskType, []byte(request.Payload))

	var opts []asynq.Option

	if request.Queue != "" {
		opts = append(opts, asynq.Queue(request.Queue))
	}
	if request.MaxRetry > 0 {
		opts = append(opts, asynq.MaxRetry(request.MaxRetry))
	}
	if request.TimeoutSecs > 0 {
		opts = append(opts, asynq.Timeout(time.Duration(request.TimeoutSecs)*time.Second))
	}
	if request.DelaySecs > 0 {
		opts = append(opts, asynq.ProcessIn(time.Duration(request.DelaySecs)*time.Second))
	}

	info, err := client.Enqueue(task, opts...)
	if err != nil {
		return EnqueueResult{}, fmt.Errorf("failed to enqueue task: %w", err)
	}

	return EnqueueResult{TaskID: info.ID}, nil
}
