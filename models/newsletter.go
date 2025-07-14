package models

import "time"

type Newsletter struct {
	Email     string `gorm:"primaryKey;not null"`
	Status    int    `gorm:"default:0"`
	CreatedAt time.Time
}
