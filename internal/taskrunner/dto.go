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

type SavedRequest struct {
	ID            uint   `json:"id"`
	EnvironmentID uint   `json:"environmentId"`
	Name          string `json:"name"`
	Queue         string `json:"queue"`
	TaskType      string `json:"taskType"`
	Payload       string `json:"payload"`
	MaxRetry      int    `json:"maxRetry"`
	TimeoutSecs   int64  `json:"timeoutSecs"`
	DelaySecs     int64  `json:"delaySecs"`
}

type CreateSavedRequestInput struct {
	Name        string `json:"name"`
	Queue       string `json:"queue"`
	TaskType    string `json:"taskType"`
	Payload     string `json:"payload"`
	MaxRetry    int    `json:"maxRetry"`
	TimeoutSecs int64  `json:"timeoutSecs"`
	DelaySecs   int64  `json:"delaySecs"`
}

type UpdateSavedRequestInput struct {
	Name        string `json:"name"`
	Queue       string `json:"queue"`
	TaskType    string `json:"taskType"`
	Payload     string `json:"payload"`
	MaxRetry    int    `json:"maxRetry"`
	TimeoutSecs int64  `json:"timeoutSecs"`
	DelaySecs   int64  `json:"delaySecs"`
}

type RenameSavedRequestInput struct {
	Name string `json:"name"`
}
