package scheduler

type SchedulerEntry struct {
	ID             string   `json:"id"`
	Spec           string   `json:"spec"`
	TaskType       string   `json:"taskType"`
	TaskPayload    string   `json:"taskPayload"`
	Options        []string `json:"options"`
	NextEnqueueAt  string   `json:"nextEnqueueAt"`
	PrevEnqueueAt  string   `json:"prevEnqueueAt"`
}

type EnqueueEvent struct {
	TaskID     string `json:"taskID"`
	EnqueuedAt string `json:"enqueuedAt"`
}

type SchedulersData struct {
	Entries []SchedulerEntry `json:"entries"`
}

type PaginatedEvents struct {
	Events     []EnqueueEvent `json:"events"`
	TotalCount int            `json:"totalCount"`
	Page       int            `json:"page"`
	PageSize   int            `json:"pageSize"`
}
