package models

type ProjectDistrict uint

const (
	Unknown_District ProjectDistrict = iota
	Riverside
	Northgate
	Old_Town
	Greenfield
	Westmoor
	Lakeside
	Sunset_Heights
	Hillcrest
	Maplewood
	Downtown_Core
	Brookstone
	Southbridge
	Ironwood
	Eastbay
	Silvergrove
	Crescent_Hollow
)

func ProjectDistrictMap() map[ProjectDistrict]string {
	return map[ProjectDistrict]string{
		Unknown_District: "Unknown District",
		Riverside:        "Riverside",
		Northgate:        "Northgate",
		Old_Town:         "Old Town",
		Greenfield:       "Greenfield",
		Westmoor:         "Westmoor",
		Lakeside:         "Lakeside",
		Sunset_Heights:   "Sunset Heights",
		Hillcrest:        "Hillcrest",
		Maplewood:        "Maplewood",
		Downtown_Core:    "Downtown Core",
		Brookstone:       "Brookstone",
		Southbridge:      "Southbridge",
		Ironwood:         "Ironwood",
		Eastbay:          "Eastbay",
		Silvergrove:      "Silvergrove",
		Crescent_Hollow:  "Crescent Hollow",
	}
}

// Note - JS common.js has its own map to map project district -> string name
