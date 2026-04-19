package environment

import (
	"github.com/jorgelhd94-tpp/asynqa/internal/domain"
	"gorm.io/gorm"
)

type EnvironmentStore struct {
	db *gorm.DB
}

func NewEnvironmentStore(db *gorm.DB) *EnvironmentStore {
	return &EnvironmentStore{db: db}
}

func (s *EnvironmentStore) GetAll() ([]domain.Environment, error) {
	var envs []domain.Environment
	result := s.db.Order("created_at desc").Find(&envs)
	return envs, result.Error
}

func (s *EnvironmentStore) FindByID(id uint) (domain.Environment, error) {
	var env domain.Environment
	result := s.db.First(&env, id)
	return env, result.Error
}

func (s *EnvironmentStore) Create(env *domain.Environment) error {
	return s.db.Create(env).Error
}

func (s *EnvironmentStore) Update(env *domain.Environment) error {
	return s.db.Save(env).Error
}

func (s *EnvironmentStore) Delete(id uint) error {
	return s.db.Delete(&domain.Environment{}, id).Error
}
