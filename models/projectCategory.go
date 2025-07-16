package models

type ProjectCategory uint

const (
	Culture_Arts ProjectCategory = iota
	Health_Social_assistance
	Community_Integration
	Greenery_Nature
	Education
	Sports_Recreation
	Public_Infrastructure
	Road_Infrastructure
	Environmental_Protection
	Other
)

// Note - JS common.js has its own map to map project category -> string name
