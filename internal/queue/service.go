package queue

import (
	"fmt"
	"time"

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

func mapQueueInfo(info *asynq.QueueInfo) QueueInfo {
	return QueueInfo{
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
}

func formatTime(t time.Time) string {
	if t.IsZero() {
		return ""
	}
	return t.Format(time.RFC3339)
}

func mapTaskInfo(t *asynq.TaskInfo) TaskInfo {
	return TaskInfo{
		ID:            t.ID,
		Queue:         t.Queue,
		Type:          t.Type,
		Payload:       string(t.Payload),
		State:         t.State.String(),
		MaxRetry:      t.MaxRetry,
		Retried:       t.Retried,
		LastErr:       t.LastErr,
		LastFailedAt:  formatTime(t.LastFailedAt),
		NextProcessAt: formatTime(t.NextProcessAt),
		TimeoutSecs:   int64(t.Timeout.Seconds()),
		RetentionSecs: int64(t.Retention.Seconds()),
		Deadline:      formatTime(t.Deadline),
		CompletedAt:   formatTime(t.CompletedAt),
		Group:         t.Group,
		Result:        string(t.Result),
		IsOrphaned:    t.IsOrphaned,
	}
}

func mapTaskInfoList(tasks []*asynq.TaskInfo) []TaskInfo {
	result := make([]TaskInfo, 0, len(tasks))
	for _, t := range tasks {
		result = append(result, mapTaskInfo(t))
	}
	return result
}

// ---------------------------------------------------------------------------
// Queue list
// ---------------------------------------------------------------------------

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

	data := QueuesData{TotalQueues: len(queueNames)}

	for _, name := range queueNames {
		info, err := inspector.GetQueueInfo(name)
		if err != nil {
			continue
		}

		data.Queues = append(data.Queues, mapQueueInfo(info))
		data.TotalTasks += info.Size

		if info.Paused {
			data.PausedQueues++
		} else {
			data.ActiveQueues++
		}
	}

	return data, nil
}

// ---------------------------------------------------------------------------
// Queue detail
// ---------------------------------------------------------------------------

func (s *QueueService) GetQueueDetail(environmentID uint, queueName string) (QueueDetailData, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return QueueDetailData{}, err
	}
	defer inspector.Close()

	info, err := inspector.GetQueueInfo(queueName)
	if err != nil {
		return QueueDetailData{}, fmt.Errorf("failed to get queue info for %q: %w", queueName, err)
	}

	var history []DailyStats
	dailyStats, err := inspector.History(queueName, 14)
	if err == nil {
		for _, h := range dailyStats {
			history = append(history, DailyStats{
				Date:      h.Date.Format(time.DateOnly),
				Processed: h.Processed,
				Failed:    h.Failed,
			})
		}
	}

	return QueueDetailData{
		Info:    mapQueueInfo(info),
		History: history,
	}, nil
}

// ---------------------------------------------------------------------------
// Queue actions
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Task listing
// ---------------------------------------------------------------------------

func (s *QueueService) ListPendingTasks(environmentID uint, queueName string, page, pageSize int) (PaginatedTaskList, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return PaginatedTaskList{}, err
	}
	defer inspector.Close()

	tasks, err := inspector.ListPendingTasks(queueName, asynq.Page(page), asynq.PageSize(pageSize))
	if err != nil {
		return PaginatedTaskList{}, fmt.Errorf("failed to list pending tasks: %w", err)
	}

	info, err := inspector.GetQueueInfo(queueName)
	if err != nil {
		return PaginatedTaskList{}, fmt.Errorf("failed to get queue info: %w", err)
	}

	return PaginatedTaskList{
		Tasks:      mapTaskInfoList(tasks),
		TotalCount: info.Pending,
		Page:       page,
		PageSize:   pageSize,
	}, nil
}

func (s *QueueService) ListActiveTasks(environmentID uint, queueName string, page, pageSize int) (PaginatedTaskList, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return PaginatedTaskList{}, err
	}
	defer inspector.Close()

	tasks, err := inspector.ListActiveTasks(queueName, asynq.Page(page), asynq.PageSize(pageSize))
	if err != nil {
		return PaginatedTaskList{}, fmt.Errorf("failed to list active tasks: %w", err)
	}

	info, err := inspector.GetQueueInfo(queueName)
	if err != nil {
		return PaginatedTaskList{}, fmt.Errorf("failed to get queue info: %w", err)
	}

	return PaginatedTaskList{
		Tasks:      mapTaskInfoList(tasks),
		TotalCount: info.Active,
		Page:       page,
		PageSize:   pageSize,
	}, nil
}

func (s *QueueService) ListScheduledTasks(environmentID uint, queueName string, page, pageSize int) (PaginatedTaskList, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return PaginatedTaskList{}, err
	}
	defer inspector.Close()

	tasks, err := inspector.ListScheduledTasks(queueName, asynq.Page(page), asynq.PageSize(pageSize))
	if err != nil {
		return PaginatedTaskList{}, fmt.Errorf("failed to list scheduled tasks: %w", err)
	}

	info, err := inspector.GetQueueInfo(queueName)
	if err != nil {
		return PaginatedTaskList{}, fmt.Errorf("failed to get queue info: %w", err)
	}

	return PaginatedTaskList{
		Tasks:      mapTaskInfoList(tasks),
		TotalCount: info.Scheduled,
		Page:       page,
		PageSize:   pageSize,
	}, nil
}

func (s *QueueService) ListRetryTasks(environmentID uint, queueName string, page, pageSize int) (PaginatedTaskList, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return PaginatedTaskList{}, err
	}
	defer inspector.Close()

	tasks, err := inspector.ListRetryTasks(queueName, asynq.Page(page), asynq.PageSize(pageSize))
	if err != nil {
		return PaginatedTaskList{}, fmt.Errorf("failed to list retry tasks: %w", err)
	}

	info, err := inspector.GetQueueInfo(queueName)
	if err != nil {
		return PaginatedTaskList{}, fmt.Errorf("failed to get queue info: %w", err)
	}

	return PaginatedTaskList{
		Tasks:      mapTaskInfoList(tasks),
		TotalCount: info.Retry,
		Page:       page,
		PageSize:   pageSize,
	}, nil
}

func (s *QueueService) ListArchivedTasks(environmentID uint, queueName string, page, pageSize int) (PaginatedTaskList, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return PaginatedTaskList{}, err
	}
	defer inspector.Close()

	tasks, err := inspector.ListArchivedTasks(queueName, asynq.Page(page), asynq.PageSize(pageSize))
	if err != nil {
		return PaginatedTaskList{}, fmt.Errorf("failed to list archived tasks: %w", err)
	}

	info, err := inspector.GetQueueInfo(queueName)
	if err != nil {
		return PaginatedTaskList{}, fmt.Errorf("failed to get queue info: %w", err)
	}

	return PaginatedTaskList{
		Tasks:      mapTaskInfoList(tasks),
		TotalCount: info.Archived,
		Page:       page,
		PageSize:   pageSize,
	}, nil
}

func (s *QueueService) ListCompletedTasks(environmentID uint, queueName string, page, pageSize int) (PaginatedTaskList, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return PaginatedTaskList{}, err
	}
	defer inspector.Close()

	tasks, err := inspector.ListCompletedTasks(queueName, asynq.Page(page), asynq.PageSize(pageSize))
	if err != nil {
		return PaginatedTaskList{}, fmt.Errorf("failed to list completed tasks: %w", err)
	}

	info, err := inspector.GetQueueInfo(queueName)
	if err != nil {
		return PaginatedTaskList{}, fmt.Errorf("failed to get queue info: %w", err)
	}

	return PaginatedTaskList{
		Tasks:      mapTaskInfoList(tasks),
		TotalCount: info.Completed,
		Page:       page,
		PageSize:   pageSize,
	}, nil
}

// ---------------------------------------------------------------------------
// Individual task actions
// ---------------------------------------------------------------------------

func (s *QueueService) RunTask(environmentID uint, queueName, taskID string) error {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return err
	}
	defer inspector.Close()

	if err := inspector.RunTask(queueName, taskID); err != nil {
		return fmt.Errorf("failed to run task %q: %w", taskID, err)
	}
	return nil
}

func (s *QueueService) DeleteTask(environmentID uint, queueName, taskID string) error {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return err
	}
	defer inspector.Close()

	if err := inspector.DeleteTask(queueName, taskID); err != nil {
		return fmt.Errorf("failed to delete task %q: %w", taskID, err)
	}
	return nil
}

func (s *QueueService) ArchiveTask(environmentID uint, queueName, taskID string) error {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return err
	}
	defer inspector.Close()

	if err := inspector.ArchiveTask(queueName, taskID); err != nil {
		return fmt.Errorf("failed to archive task %q: %w", taskID, err)
	}
	return nil
}

func (s *QueueService) CancelActiveTask(environmentID uint, taskID string) error {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return err
	}
	defer inspector.Close()

	if err := inspector.CancelProcessing(taskID); err != nil {
		return fmt.Errorf("failed to cancel task %q: %w", taskID, err)
	}
	return nil
}

// ---------------------------------------------------------------------------
// Bulk actions
// ---------------------------------------------------------------------------

func (s *QueueService) RunAllScheduledTasks(environmentID uint, queueName string) (BulkActionResult, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return BulkActionResult{}, err
	}
	defer inspector.Close()

	count, err := inspector.RunAllScheduledTasks(queueName)
	if err != nil {
		return BulkActionResult{}, fmt.Errorf("failed to run all scheduled tasks: %w", err)
	}
	return BulkActionResult{Count: count}, nil
}

func (s *QueueService) RunAllRetryTasks(environmentID uint, queueName string) (BulkActionResult, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return BulkActionResult{}, err
	}
	defer inspector.Close()

	count, err := inspector.RunAllRetryTasks(queueName)
	if err != nil {
		return BulkActionResult{}, fmt.Errorf("failed to run all retry tasks: %w", err)
	}
	return BulkActionResult{Count: count}, nil
}

func (s *QueueService) RunAllArchivedTasks(environmentID uint, queueName string) (BulkActionResult, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return BulkActionResult{}, err
	}
	defer inspector.Close()

	count, err := inspector.RunAllArchivedTasks(queueName)
	if err != nil {
		return BulkActionResult{}, fmt.Errorf("failed to run all archived tasks: %w", err)
	}
	return BulkActionResult{Count: count}, nil
}

func (s *QueueService) ArchiveAllPendingTasks(environmentID uint, queueName string) (BulkActionResult, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return BulkActionResult{}, err
	}
	defer inspector.Close()

	count, err := inspector.ArchiveAllPendingTasks(queueName)
	if err != nil {
		return BulkActionResult{}, fmt.Errorf("failed to archive all pending tasks: %w", err)
	}
	return BulkActionResult{Count: count}, nil
}

func (s *QueueService) ArchiveAllScheduledTasks(environmentID uint, queueName string) (BulkActionResult, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return BulkActionResult{}, err
	}
	defer inspector.Close()

	count, err := inspector.ArchiveAllScheduledTasks(queueName)
	if err != nil {
		return BulkActionResult{}, fmt.Errorf("failed to archive all scheduled tasks: %w", err)
	}
	return BulkActionResult{Count: count}, nil
}

func (s *QueueService) ArchiveAllRetryTasks(environmentID uint, queueName string) (BulkActionResult, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return BulkActionResult{}, err
	}
	defer inspector.Close()

	count, err := inspector.ArchiveAllRetryTasks(queueName)
	if err != nil {
		return BulkActionResult{}, fmt.Errorf("failed to archive all retry tasks: %w", err)
	}
	return BulkActionResult{Count: count}, nil
}

func (s *QueueService) DeleteAllPendingTasks(environmentID uint, queueName string) (BulkActionResult, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return BulkActionResult{}, err
	}
	defer inspector.Close()

	count, err := inspector.DeleteAllPendingTasks(queueName)
	if err != nil {
		return BulkActionResult{}, fmt.Errorf("failed to delete all pending tasks: %w", err)
	}
	return BulkActionResult{Count: count}, nil
}

func (s *QueueService) DeleteAllScheduledTasks(environmentID uint, queueName string) (BulkActionResult, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return BulkActionResult{}, err
	}
	defer inspector.Close()

	count, err := inspector.DeleteAllScheduledTasks(queueName)
	if err != nil {
		return BulkActionResult{}, fmt.Errorf("failed to delete all scheduled tasks: %w", err)
	}
	return BulkActionResult{Count: count}, nil
}

func (s *QueueService) DeleteAllRetryTasks(environmentID uint, queueName string) (BulkActionResult, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return BulkActionResult{}, err
	}
	defer inspector.Close()

	count, err := inspector.DeleteAllRetryTasks(queueName)
	if err != nil {
		return BulkActionResult{}, fmt.Errorf("failed to delete all retry tasks: %w", err)
	}
	return BulkActionResult{Count: count}, nil
}

func (s *QueueService) DeleteAllArchivedTasks(environmentID uint, queueName string) (BulkActionResult, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return BulkActionResult{}, err
	}
	defer inspector.Close()

	count, err := inspector.DeleteAllArchivedTasks(queueName)
	if err != nil {
		return BulkActionResult{}, fmt.Errorf("failed to delete all archived tasks: %w", err)
	}
	return BulkActionResult{Count: count}, nil
}

func (s *QueueService) DeleteAllCompletedTasks(environmentID uint, queueName string) (BulkActionResult, error) {
	inspector, err := s.newInspector(environmentID)
	if err != nil {
		return BulkActionResult{}, err
	}
	defer inspector.Close()

	count, err := inspector.DeleteAllCompletedTasks(queueName)
	if err != nil {
		return BulkActionResult{}, fmt.Errorf("failed to delete all completed tasks: %w", err)
	}
	return BulkActionResult{Count: count}, nil
}
