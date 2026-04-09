package database

import (
	"github.com/jorgelhd94-tpp/asynqa/internal/domain"
	"gorm.io/gorm"
)

func Automigrate(db *gorm.DB) error {
	return db.AutoMigrate(&domain.Environment{})
}
