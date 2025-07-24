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

func ProjectStatusMap() map[ProjectStatus]string {
	return map[ProjectStatus]string{
		PENDING:     "Pending",
		REJECTED:    "Rejected",
		ACCEPTED:    "Accepted",
		IN_PROGRESS: "In Progress",
		CANCELLED:   "Cancelled",
		REALIZED:    "Realized",
	}
}

// Note - JS common.js has its own map
