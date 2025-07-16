package models

import "time"

type Project struct {
	ID              uint             `json:"id" gorm:"primaryKey"`
	Title           string           `json:"title" gorm:"not null"`
	Description     string           `json:"description" gorm:"type:text"`
	AuthorID        uint             `json:"author_id"` // who submitted the project
	Status          ProjectStatus    `json:"status"`
	VotesUp         int              `json:"votes_up"`
	VotesDown       int              `json:"votes_down"`
	CreatedAt       time.Time        `json:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at"`
	Category        ProjectCategory  `json:"category"`
	Location        string           `json:"location"`
	ImageURL        string           `json:"image_url"`
	ProjectComments []ProjectComment `json:"comments,omitempty" gorm:"foreignKey:ProjectID"`
}

type ProjectComment struct {
	ID        uint      `json:"id"         gorm:"primaryKey;autoIncrement"`
	ProjectID uint      `json:"project_id" gorm:"index"`
	UserID    uint      `json:"user_id"    gorm:"index"`
	Content   string    `json:"content"    gorm:"type:text;not null"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}
