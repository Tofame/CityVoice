package models

type ProjectStatus uint

const (
	PENDING ProjectStatus = iota
	IN_PROGRESS
	REJECTED
	ACCEPTED
	REALIZED
)

func (ps ProjectStatus) String() string {
	return [...]string{"PENDING", "IN_PROGRESS", "REJECTED", "ACCEPTED", "REALIZED"}[ps]
}

// Note - JS script.js has its own map
