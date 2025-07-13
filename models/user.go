package models

import "time"

type User struct {
	ID         uint   `gorm:"primaryKey"`
	Email      string `gorm:"unique;not null"`
	Password   string `gorm:"size:300;not null"`
	IsVerified bool   `gorm:"default:false"`
	CreatedAt  time.Time
	Access     AccessLevel `gorm:"default:1"`
}
