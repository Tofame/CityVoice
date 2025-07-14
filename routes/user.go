package routes

import (
	"CityVoice/database"
	"CityVoice/middleware"
	"CityVoice/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func UserRoutes(r *gin.Engine) {
	user := r.Group("/user")
	user.Use(middleware.RequireJWTAuth())
	user.GET("/email", getEmail)
	user.GET("/id", getUserId)
	user.GET("/profile", getUserProfile)

	user.GET("/:id/profile",
		middleware.RequireAccess(models.AccessAdmin),
		getProfileByID,
	)
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

func getProfileByID(c *gin.Context) {
	// id comes from URL: /user/42/profile

	idParam := c.Param("id")
	var user models.User
	if err := database.DB.First(&user, idParam).Error; err != nil {
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
