package routes

import (
	"CityVoice/database"
	"CityVoice/models"
	"gorm.io/gorm"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ServiceRoutes(r *gin.Engine) {
	user := r.Group("/service")
	user.POST("/newsletter", signupNewsletter)
}

func signupNewsletter(c *gin.Context) {
	type RequestBody struct {
		Email string `json:"email" binding:"required,email"`
	}

	var reqBody RequestBody
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}

	var existing models.Newsletter
	err := database.DB.Where("email = ?", reqBody.Email).First(&existing).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			newEntry := models.Newsletter{
				Email:  reqBody.Email,
				Status: 0,
			}
			if err := database.DB.Create(&newEntry).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not sign up"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
	}

	// Always return a generic success response
	c.JSON(http.StatusOK, gin.H{
		"message": "Signed up for newsletter (check your email: " + reqBody.Email + " to confirm)",
	})
}
