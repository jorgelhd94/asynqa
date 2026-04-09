package services

import (
	"crypto/tls"
	"fmt"

	"github.com/hibiken/asynq"
	"github.com/jorgelhd94-tpp/asynqa/internal/domain"
	"gorm.io/gorm"
)

type EnvironmentService struct {
	db *gorm.DB
}

func NewEnvironmentService(db *gorm.DB) *EnvironmentService {
	return &EnvironmentService{db: db}
}

func (s *EnvironmentService) GetAll() ([]domain.Environment, error) {
	var envs []domain.Environment
	result := s.db.Order("created_at desc").Find(&envs)
	return envs, result.Error
}

func (s *EnvironmentService) Create(env domain.Environment) (domain.Environment, error) {
	result := s.db.Create(&env)
	return env, result.Error
}

func (s *EnvironmentService) Update(env domain.Environment) (domain.Environment, error) {
	result := s.db.Save(&env)
	return env, result.Error
}

func (s *EnvironmentService) Delete(id uint) error {
	return s.db.Delete(&domain.Environment{}, id).Error
}

func (s *EnvironmentService) TestConnection(env domain.Environment) error {
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

	inspector := asynq.NewInspector(opts)
	defer inspector.Close()

	_, err := inspector.Queues()
	if err != nil {
		return fmt.Errorf("connection failed: %w", err)
	}

	return nil
}
