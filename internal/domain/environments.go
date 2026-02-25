package domain

import "gorm.io/gorm"

type Environment struct {
	gorm.Model
	Name string
}
