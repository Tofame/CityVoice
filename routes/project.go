package routes

import (
	"CityVoice/database"
	"CityVoice/middleware"
	"CityVoice/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func ProjectRoutes(r *gin.Engine) {
	project := r.Group("/project")
	project.Use(middleware.RequireJWTAuth())

	project.POST("", submitProject)
	project.GET("/:id", getProjectByID)
	project.GET("", getProjects)

	admin := project.Group("")
	admin.Use(middleware.RequireAccess(models.AccessAdmin))

	admin.PUT("/:id", updateProject)
	admin.PATCH("/:id/status", changeStatus)
	admin.DELETE("/:id", deleteProject)
}

func submitProject(c *gin.Context) {
	var input struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description" binding:"required"`
		Category    string `json:"category" binding:"required"`
		Location    string `json:"location" binding:"required"`
		ImageURL    string `json:"image_url"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	project := models.Project{
		Title:       input.Title,
		Description: input.Description,
		Category:    input.Category,
		Location:    input.Location,
		ImageURL:    input.ImageURL,
		Status:      models.PENDING,
		AuthorID:    userID,
	}

	if err := database.DB.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project"})
		return
	}

	c.JSON(http.StatusCreated, project)
}
func getProjectByID(c *gin.Context) {
	id := c.Param("id")

	var project models.Project
	if err := database.DB.Preload("ProjectComments").First(&project, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	// Restrict access to only non-pending projects unless admin or author
	if project.Status == models.PENDING && !middleware.IsAdmin(c) {
		userID, ok := middleware.GetUserID(c)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		if userID != project.AuthorID {
			c.JSON(http.StatusForbidden, gin.H{"error": "You are not the author of this project"})
			return
		}
	}

	c.JSON(http.StatusOK, project)
}
func getProjects(c *gin.Context) {
	query := database.DB.Model(&models.Project{})

	// Users shouldn't see pending projects, only accepted ones.
	if !middleware.IsAdmin(c) {
		query = query.Where("status != ?", models.PENDING)
	}

	if author := c.Query("author_id"); author != "" {
		query = query.Where("author_id = ?", author)
	}

	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	var projects []models.Project
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}

	c.JSON(http.StatusOK, projects)
}

func updateProject(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Category    string `json:"category"`
		Location    string `json:"location"`
		ImageURL    string `json:"image_url"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var project models.Project
	if err := database.DB.First(&project, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	project.Title = input.Title
	project.Description = input.Description
	project.Category = input.Category
	project.Location = input.Location
	project.ImageURL = input.ImageURL

	if err := database.DB.Save(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update project"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project updated"})
}
func changeStatus(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		Status models.ProjectStatus `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status value"})
		return
	}

	var project models.Project
	if err := database.DB.First(&project, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	project.Status = input.Status

	if err := database.DB.Save(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to change project status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project status updated"})
}
func deleteProject(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Project{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted"})
}
