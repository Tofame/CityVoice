package main

import (
	"CityVoice/database"
	"CityVoice/models"
	"CityVoice/routes"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"strconv"

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

	// Safety thing, to not allow spoofed ips
	r.SetTrustedProxies(nil)

	r.Static("/static", "./view/static")

	routes.AuthRoutes(r)
	routes.ServiceRoutes(r)
	routes.UserRoutes(r)
	routes.UsersRoutes(r)
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
	r.GET("/browse_projects", func(c *gin.Context) {
		render(c, "browse_projects.html", gin.H{"Title": "Browsing Projects - CityVoice"})
	})
	r.GET("/know_more", func(c *gin.Context) {
		render(c, "know_more.html", gin.H{"Title": "Know More - CityVoice"})
	})

	r.GET("/projects/:id", func(c *gin.Context) {
		projectIDStr := c.Param("id")
		projectID, err := strconv.ParseUint(projectIDStr, 10, 32) // convert to uint, base 10 because 0-9 numbers, 32 because uint32_t
		if err != nil {
			// Handle invalid ID format e.g., if someone types /projects/abc
			render(c, "error.html", gin.H{"Title": "Error", "Message": "Invalid project ID format."})
			return
		}

		var project models.Project
		// Fetch the project from the database
		if err := database.DB.
			Preload("ProjectComments", func(db *gorm.DB) *gorm.DB {
				return db.Order("created_at DESC").Limit(10)
			}).
			First(&project, projectID).Error; err != nil {

			if err == gorm.ErrRecordNotFound {
				render(c, "error.html", gin.H{"Title": "Not Found", "Message": "Project not found."})
			} else {
				render(c, "error.html", gin.H{"Title": "Error", "Message": "Failed to retrieve project details."})
			}
			return
		}

		// We pass the data to template, we can later use that inside html. Interesting stuff.
		data := gin.H{
			"Title":              "Project Details - " + project.Title,
			"Project":            project,
			"ProjectStatusMap":   models.ProjectStatusMap(),
			"ProjectCategoryMap": models.ProjectCategoryMap(),
			"ProjectDistrictMap": models.ProjectDistrictMap(),
		}

		render(c, "project_details.html", data)
	})

	r.Run(":8080")
}
