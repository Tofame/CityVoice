package routes

import (
	"CityVoice/database"
	"CityVoice/middleware"
	"CityVoice/models"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func ProjectRoutes(r *gin.Engine) {
	project := r.Group("/api/project")

	project.GET("/:id", getProjectByID)
	project.GET("", getProjects)
	project.POST("", middleware.RequireJWTAuth(), submitProject)

	admin := project.Group("")
	admin.Use(middleware.RequireJWTAuth(), middleware.RequireAccess(models.AccessAdmin))

	admin.PUT("/:id", updateProject)
	admin.PATCH("/:id/status", changeStatus)
	admin.DELETE("/:id", deleteProject)
}

func submitProject(c *gin.Context) {
	var input struct {
		Title       string                 `json:"title" binding:"required"`
		Description string                 `json:"description" binding:"required"`
		Category    models.ProjectCategory `json:"category" binding:"required"`
		Location    string                 `json:"location" binding:"required"`
		ImageURL    string                 `json:"image_url"`
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

	// Filtering
	if s := strings.TrimSpace(c.Query("search")); s != "" {
		like := "%" + strings.ToLower(s) + "%"
		query = query.Where("(LOWER(title) LIKE ?)", like)
	}

	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	createdAfter := c.Query("created_after")
	createdBefore := c.Query("created_before")
	if createdAfter != "" {
		query = query.Where("created_at >= ?", createdAfter)
	}
	if createdBefore != "" {
		query = query.Where("created_at <= ?", createdBefore)
	}

	order := strings.ToLower(c.DefaultQuery("order", "newest"))
	switch order {
	case "most_popular_up":
		query = query.Order("votes_up DESC")
		break
	case "most_popular_down":
		query = query.Order("votes_up ASC")
		break
	case "least_popular_up":
		query = query.Order("votes_down DESC")
		break
	case "least_popular_down":
		query = query.Order("votes_down ASC")
		break
	case "oldest":
		query = query.Order("created_at ASC")
		break
	case "newest":
	default:
		query = query.Order("created_at DESC")
	}

	// Pagination params
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	// Get total count before limit/offset
	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count projects"})
		return
	}

	var projects []models.Project
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}

	// Return projects + pagination metadata
	c.JSON(http.StatusOK, gin.H{
		"projects": projects,
		"total":    total,
		"page":     page,
		"limit":    limit,
	})
}

func updateProject(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		Title       string                 `json:"title"`
		Description string                 `json:"description"`
		Category    models.ProjectCategory `json:"category"`
		Location    string                 `json:"location"`
		ImageURL    string                 `json:"image_url"`
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
