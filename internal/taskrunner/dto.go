package taskrunner

type EnqueueRequest struct {
	Queue       string `json:"queue"`
	TaskType    string `json:"taskType"`
	Payload     string `json:"payload"`
	MaxRetry    int    `json:"maxRetry"`
	TimeoutSecs int64  `json:"timeoutSecs"`
	DelaySecs   int64  `json:"delaySecs"`
}

type EnqueueResult struct {
	TaskID string `json:"taskID"`
}
