package models

import "time"

type User struct {
	ID         uint        `gorm:"primaryKey" json:"user_id"`
	Email      string      `gorm:"unique;not null" json:"email"`
	Password   string      `gorm:"size:300;not null" json:"-"`
	IsVerified bool        `gorm:"default:false" json:"is_verified"`
	CreatedAt  time.Time   `json:"created_at"`
	Access     AccessLevel `gorm:"default:1" json:"access"`
	Name       *string     `gorm:"column:name;varchar(255)" json:"name"`
	Surname    *string     `gorm:"column:surname;varchar(255)" json:"surname"`
}
