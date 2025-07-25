package routes

import (
	"CityVoice/database"
	"CityVoice/middleware"
	"CityVoice/models"
	"github.com/gin-gonic/gin"
	"net/http"
)

func UserRoutes(r *gin.Engine) {
	user := r.Group("/api/user")
	user.Use(middleware.RequireJWTAuth())
	user.GET("/email", getEmail)
	user.GET("/id", getUserId)
	user.GET("/profile", getUserProfile)
	user.GET("/projects", getUserProjects)
}

func getEmail(c *gin.Context) {
	uidAny, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := uidAny.(uint) // id from jwt

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"email": user.Email})
}

func getUserId(c *gin.Context) {
	uidAny, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := uidAny.(uint) // id from jwt

	c.JSON(http.StatusOK, gin.H{"user_id": userID})
}

func getUserProfile(c *gin.Context) {
	uidAny, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := uidAny.(uint) // id from jwt

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id":     user.ID,
		"email":       user.Email,
		"is_verified": user.IsVerified,
		"created_at":  user.CreatedAt,
		"access":      user.Access,
		"name":        user.Name,
		"surname":     user.Surname,
	})
}

func getUserProjects(c *gin.Context) {
	uidAny, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := uidAny.(uint)

	var projects []models.Project
	if err := database.DB.
		Where("author_id = ?", userID).
		Order("created_at DESC").
		Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"projects": projects})
}
