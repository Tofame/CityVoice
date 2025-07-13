package main

import (
	"CityVoice/database"
	"CityVoice/routes"
	"github.com/gin-gonic/gin"
)

func main() {
	database.Connect()

	r := gin.Default()
	routes.AuthRoutes(r)

	r.Run(":8080")
}
