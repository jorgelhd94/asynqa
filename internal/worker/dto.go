package worker

type WorkerInfo struct {
	TaskID  string `json:"taskID"`
	Queue   string `json:"queue"`
	Type    string `json:"type"`
	Payload string `json:"payload"`
	Started string `json:"started"`
}

type ServerInfo struct {
	ID             string       `json:"id"`
	Host           string       `json:"host"`
	PID            int          `json:"pid"`
	Queues         []string     `json:"queues"`
	StrictPriority bool         `json:"strictPriority"`
	Started        string       `json:"started"`
	Status         string       `json:"status"`
	Concurrency    int          `json:"concurrency"`
	ActiveWorkers  []WorkerInfo `json:"activeWorkers"`
}

type WorkersData struct {
	Servers      []ServerInfo `json:"servers"`
	TotalWorkers int          `json:"totalWorkers"`
}
