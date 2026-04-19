package environment

import (
	"fmt"

	"github.com/hibiken/asynq"
	"github.com/jorgelhd94-tpp/asynqa/internal/domain"
	"github.com/jorgelhd94-tpp/asynqa/internal/shared"
)

type EnvironmentService struct {
	store *EnvironmentStore
}

func NewEnvironmentService(store *EnvironmentStore) *EnvironmentService {
	return &EnvironmentService{store: store}
}

func (s *EnvironmentService) GetAll() ([]domain.Environment, error) {
	return s.store.GetAll()
}

func (s *EnvironmentService) Create(env domain.Environment) (domain.Environment, error) {
	if err := s.store.Create(&env); err != nil {
		return domain.Environment{}, err
	}
	return env, nil
}

func (s *EnvironmentService) Update(env domain.Environment) (domain.Environment, error) {
	if err := s.store.Update(&env); err != nil {
		return domain.Environment{}, err
	}
	return env, nil
}

func (s *EnvironmentService) Delete(id uint) error {
	return s.store.Delete(id)
}

func (s *EnvironmentService) TestConnection(env domain.Environment) error {
	inspector := asynq.NewInspector(shared.NewRedisOpts(env))
	defer inspector.Close()

	_, err := inspector.Queues()
	if err != nil {
		return fmt.Errorf("connection failed: %w", err)
	}

	return nil
}
