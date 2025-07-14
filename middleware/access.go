package middleware

import (
	"CityVoice/database"
	"CityVoice/models"
	"github.com/gin-gonic/gin"
)

func RequireAccess(level models.AccessLevel) gin.HandlerFunc {
	return func(c *gin.Context) {
		uidAny, ok := c.Get("user_id")
		if !ok {
			c.AbortWithStatusJSON(401, gin.H{"error": "login required"})
			return
		}
		var user models.User
		if err := database.DB.First(&user, uidAny).Error; err != nil {
			c.AbortWithStatusJSON(401, gin.H{"error": "user not found"})
			return
		}
		if user.Access < level {
			c.AbortWithStatusJSON(403, gin.H{"error": "insufficient rights"})
			return
		}

		c.Next()
	}
}
