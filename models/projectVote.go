package models

import "time"

type VoteType int

const (
	VoteUp   VoteType = 1
	VoteDown VoteType = -1
)

type ProjectVote struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"index;not null"`
	ProjectID uint      `gorm:"index;not null"`
	Vote      VoteType  `gorm:"not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}
