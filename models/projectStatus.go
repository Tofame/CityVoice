package models

type ProjectStatus uint

const (
	PENDING     ProjectStatus = iota
	REJECTED                  // idea was rejected
	ACCEPTED                  // idea was accepted, now users can e.g. vote on it, comment etc.
	IN_PROGRESS               // currently beaing realised
	CANCELLED                 // was in-progress, but was cancelled
	REALIZED                  // has been completed
)

func (ps ProjectStatus) String() string {
	return [...]string{"PENDING", "IN_PROGRESS", "REJECTED", "ACCEPTED", "REALIZED"}[ps]
}

// Note - JS script.js has its own map
