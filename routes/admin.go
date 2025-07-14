package routes

import (
	"CityVoice/database"
	"CityVoice/middleware"
	"CityVoice/models"
	"CityVoice/utils"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func AdminRoutes(r *gin.Engine) {
	user := r.Group("/admin")
	user.Use(middleware.RequireJWTAuth(), middleware.RequireAccess(models.AccessAdmin))

	user.GET("/users/:id", getUserProfileByID)
	user.GET("/users", getAllUsers)

	user.PUT("/users/:id", updateUserByID)
	user.DELETE("/users/:id", deleteUserByID)
}

func getUserProfileByID(c *gin.Context) {
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

func getAllUsers(c *gin.Context) {
	db := database.DB

	// Query Parameters
	access := c.Query("access")
	createdAfter := c.Query("created_after")
	createdBefore := c.Query("created_before")
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "10")

	var users []models.User
	query := db.Model(&models.User{})

	// Filtering
	if s := strings.TrimSpace(c.Query("search")); s != "" {
		like := "%" + strings.ToLower(s) + "%"
		query = query.Where("(LOWER(email) LIKE ?)", like)
	}

	if access != "" {
		query = query.Where("access = ?", access)
	}
	if createdAfter != "" {
		query = query.Where("created_at >= ?", createdAfter)
	}
	if createdBefore != "" {
		query = query.Where("created_at <= ?", createdBefore)
	}

	// Pagination
	pageInt, err1 := strconv.Atoi(page)
	limitInt, err2 := strconv.Atoi(limit)
	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pagination parameters"})
		return
	}
	offset := (pageInt - 1) * limitInt

	var total int64
	query.Count(&total)

	if err := query.Offset(offset).Limit(limitInt).Order("created_at DESC").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve users"})
		return
	}

	// Response
	c.JSON(http.StatusOK, gin.H{
		"total": total,
		"page":  pageInt,
		"limit": limitInt,
		"users": users,
	})
}

func updateUserByID(c *gin.Context) {
	idParam := c.Param("id")
	var user models.User
	if err := database.DB.First(&user, idParam).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var input struct {
		Email   string `json:"email"`
		Name    string `json:"name"`
		Surname string `json:"surname"`
		Access  int    `json:"access"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	user.Email = input.Email
	user.Name = utils.StringPtr(input.Name)
	user.Surname = utils.StringPtr(input.Surname)
	user.Access = models.AccessLevel(input.Access)

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated"})
}

func deleteUserByID(c *gin.Context) {
	idParam := c.Param("id")

	if err := database.DB.Delete(&models.User{}, idParam).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}
