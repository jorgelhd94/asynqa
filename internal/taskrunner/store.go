package taskrunner

import (
	"github.com/jorgelhd94-tpp/asynqa/internal/domain"
	"gorm.io/gorm"
)

type TaskRunnerRequestStore struct {
	db *gorm.DB
}

func NewTaskRunnerRequestStore(db *gorm.DB) *TaskRunnerRequestStore {
	return &TaskRunnerRequestStore{db: db}
}

func (s *TaskRunnerRequestStore) GetByEnvironmentID(envID uint) ([]domain.TaskRunnerRequest, error) {
	var requests []domain.TaskRunnerRequest
	result := s.db.Where("environment_id = ?", envID).Order("created_at asc").Find(&requests)
	return requests, result.Error
}

func (s *TaskRunnerRequestStore) FindByID(id uint) (domain.TaskRunnerRequest, error) {
	var req domain.TaskRunnerRequest
	result := s.db.First(&req, id)
	return req, result.Error
}

func (s *TaskRunnerRequestStore) Create(req *domain.TaskRunnerRequest) error {
	return s.db.Create(req).Error
}

func (s *TaskRunnerRequestStore) Update(req *domain.TaskRunnerRequest) error {
	return s.db.Save(req).Error
}

func (s *TaskRunnerRequestStore) Delete(id uint) error {
	return s.db.Delete(&domain.TaskRunnerRequest{}, id).Error
}
