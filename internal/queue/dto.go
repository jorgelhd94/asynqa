package queue

type QueuesData struct {
	Queues       []QueueInfo `json:"queues"`
	TotalQueues  int         `json:"totalQueues"`
	ActiveQueues int         `json:"activeQueues"`
	PausedQueues int         `json:"pausedQueues"`
	TotalTasks   int         `json:"totalTasks"`
}

type QueueInfo struct {
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
