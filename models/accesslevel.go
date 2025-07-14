package models

type AccessLevel uint

const (
	AccessGuest AccessLevel = iota
	AccessUser
	AccessMod
	AccessAdmin
)

func (u *User) IsAdmin() bool {
	return u.Access == AccessAdmin
}

func (u *User) IsModerator() bool {
	return u.Access >= AccessMod
}

func (u *User) IsVerifiedUser() bool {
	return u.Access >= AccessUser && u.IsVerified
}

// Note - JS script.js has its own map to map access level -> string name
