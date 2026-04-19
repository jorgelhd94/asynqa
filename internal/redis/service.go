package redis

import (
	"context"
	"crypto/tls"
	"fmt"
	"strings"
	"time"

	env "github.com/jorgelhd94/asynqa/internal/environment"
	goredis "github.com/redis/go-redis/v9"
)

type RedisService struct {
	environmentStore *env.EnvironmentStore
}

func NewRedisService(environmentStore *env.EnvironmentStore) *RedisService {
	return &RedisService{environmentStore: environmentStore}
}

func (s *RedisService) newClient(environmentID uint) (*goredis.Client, error) {
	env, err := s.environmentStore.FindByID(environmentID)
	if err != nil {
		return nil, fmt.Errorf("environment not found: %w", err)
	}

	opts := &goredis.Options{
		Addr:     env.Host,
		Password: env.Password,
		DB:       env.DB,
	}

	if env.UseTLS {
		opts.TLSConfig = &tls.Config{
			InsecureSkipVerify: env.TLSSkipVerify,
		}
	}

	return goredis.NewClient(opts), nil
}

func (s *RedisService) GetRedisInfo(environmentID uint) (RedisInfoData, error) {
	client, err := s.newClient(environmentID)
	if err != nil {
		return RedisInfoData{}, err
	}
	defer client.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	raw, err := client.Info(ctx, "all").Result()
	if err != nil {
		return RedisInfoData{}, fmt.Errorf("failed to get Redis info: %w", err)
	}

	data := RedisInfoData{RawInfo: raw}
	data.Sections = parseRedisInfo(raw)

	return data, nil
}

func parseRedisInfo(raw string) []RedisSection {
	var sections []RedisSection
	var current *RedisSection

	for _, line := range strings.Split(raw, "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		if strings.HasPrefix(line, "# ") {
			if current != nil {
				sections = append(sections, *current)
			}
			current = &RedisSection{Name: strings.TrimPrefix(line, "# ")}
			continue
		}

		if current != nil {
			if idx := strings.IndexByte(line, ':'); idx > 0 {
				current.Entries = append(current.Entries, RedisEntry{
					Key:   line[:idx],
					Value: line[idx+1:],
				})
			}
		}
	}

	if current != nil {
		sections = append(sections, *current)
	}

	return sections
}
