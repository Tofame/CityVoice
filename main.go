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
	routes.UserRoutes(r)
	routes.ServiceRoutes(r)
	routes.AdminRoutes(r)

	// Serve files
	r.Static("/view", "./view")
	r.GET("/", func(c *gin.Context) { c.File("./view/index.html") })

	r.Run(":8080")
}
