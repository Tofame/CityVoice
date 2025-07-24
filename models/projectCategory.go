package models

type ProjectCategory uint

const (
	Unknown_Category ProjectCategory = iota
	Culture_Arts
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

func ProjectCategoryMap() map[ProjectCategory]string {
	return map[ProjectCategory]string{
		Unknown_Category:         "Unknown Category",
		Culture_Arts:             "Culture & Arts",
		Health_Social_assistance: "Health & Social Assistance",
		Community_Integration:    "Community Integration",
		Greenery_Nature:          "Greenery & Nature",
		Education:                "Education",
		Sports_Recreation:        "Sports & Recreation",
		Public_Infrastructure:    "Public Infrastructure",
		Road_Infrastructure:      "Road Infrastructure",
		Environmental_Protection: "Environmental Protection",
		Other:                    "Other",
	}
}

// Note - JS common.js has its own map to map project category -> string name
