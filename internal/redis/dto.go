package redis

type RedisEntry struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type RedisSection struct {
	Name    string       `json:"name"`
	Entries []RedisEntry `json:"entries"`
}

type RedisInfoData struct {
	Sections []RedisSection `json:"sections"`
	RawInfo  string         `json:"rawInfo"`
}
