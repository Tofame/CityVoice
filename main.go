package main

import (
	"CityVoice/database"
	"CityVoice/routes"
	"github.com/gin-gonic/gin"

	"html/template"
	"net/http"
	"path/filepath"
)

func render(c *gin.Context, page string, data gin.H) {
	files := []string{
		"view/layout.html",
		filepath.Join("view/pages", page),
	}

	tmpl := template.Must(template.ParseFiles(files...))
	c.Status(http.StatusOK)
	c.Writer.Header().Set("Content-Type", "text/html; charset=utf-8")
	_ = tmpl.Execute(c.Writer, data)
}

func main() {
	database.Connect()
	r := gin.Default()

	r.Static("/static", "./view/static")

	routes.AuthRoutes(r)
	routes.UserRoutes(r)
	routes.ServiceRoutes(r)
	routes.AdminRoutes(r)
	routes.ProjectRoutes(r)

	r.GET("/", func(c *gin.Context) {
		render(c, "home.html", gin.H{"Title": "Home - CityVoice"})
	})
	r.GET("/home", func(c *gin.Context) {
		render(c, "home.html", gin.H{"Title": "CityVoice"})
	})
	r.GET("/login", func(c *gin.Context) {
		render(c, "login.html", gin.H{"Title": "Login - CityVoice"})
	})
	r.GET("/adminpanel", func(c *gin.Context) {
		render(c, "adminpanel.html", gin.H{"Title": "AdminPanel - CityVoice"})
	})
	r.GET("/userprofile", func(c *gin.Context) {
		render(c, "userprofile.html", gin.H{"Title": "User Profile - CityVoice"})
	})

	r.Run(":8080")
}
