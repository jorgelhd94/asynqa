package shared

import (
	"crypto/tls"

	"github.com/hibiken/asynq"
	"github.com/jorgelhd94/asynqa/internal/domain"
)

func NewRedisOpts(env domain.Environment) asynq.RedisClientOpt {
	opts := asynq.RedisClientOpt{
		Addr:     env.Host,
		Password: env.Password,
		DB:       env.DB,
	}

	if env.UseTLS {
		opts.TLSConfig = &tls.Config{
			InsecureSkipVerify: env.TLSSkipVerify,
		}
	}

	return opts
}
