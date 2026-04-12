package dto

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
