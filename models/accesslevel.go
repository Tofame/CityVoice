package models

type AccessLevel uint

const (
	AccessGuest AccessLevel = iota
	AccessUser
	AccessMod
	AccessAdmin
)

// Note - JS common.js has its own map to map access level -> string name
