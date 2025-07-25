package routes

import (
	"CityVoice/database"
	"CityVoice/middleware"
	"CityVoice/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func ProjectRoutes(r *gin.Engine) {
	project := r.Group("/api/project")

	project.GET("/:id", getProjectByID)
	project.GET("", getProjects)
	project.POST("", middleware.RequireJWTAuth(), submitProject)

	project.POST("/:id/comments", middleware.RequireJWTAuth(), submitComment)
	project.DELETE("/:id/comments/:commentID", middleware.RequireJWTAuth(), deleteComment)
	project.POST("/:id/vote", middleware.RequireJWTAuth(), castVote)

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
		District    models.ProjectDistrict `json:"district" binding:"required"`
		ImageURL    *string                `json:"image_url"`
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
		District:    input.District,
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

	// Fetch project with latest 10 comments
	if err := database.DB.
		Preload("ProjectComments", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC").Limit(10)
		}).
		First(&project, id).Error; err != nil {
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

	if district := c.Query("district"); district != "" {
		query = query.Where("district = ?", district)
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
		District    models.ProjectDistrict `json:"district"`
		Status      models.ProjectStatus   `json:"status"`
		ImageURL    *string                `json:"image_url"`
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
	project.Category = models.ProjectCategory(input.Category)
	project.District = models.ProjectDistrict(input.District)
	project.Status = models.ProjectStatus(input.Status)
	project.ImageURL = input.ImageURL
	project.UpdatedAt = time.Now()

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

func submitComment(c *gin.Context) {
	// This is taken from api request :id
	projectIDStr := c.Param("id")
	projectID, err := strconv.ParseUint(projectIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID format"})
		return
	}

	var input struct {
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	// Verify the project exists and is not PENDING (unless the current user is the author or admin)
	var project models.Project
	if err := database.DB.First(&project, projectID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve project", "details": err.Error()})
		}
		return
	}

	// Only allow commenting on non-pending projects, or if user is author/admin
	if project.Status == models.PENDING {
		if !middleware.IsAdmin(c) {
			if userID != project.AuthorID {
				c.JSON(http.StatusForbidden, gin.H{"error": "Cannot comment on pending projects"})
				return
			}
		}
	}

	comment := models.ProjectComment{
		ProjectID: uint(projectID),
		UserID:    userID,
		Content:   input.Content,
		CreatedAt: time.Now(),
	}

	if err := database.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, comment)
}

func deleteComment(c *gin.Context) {
	commentIDStr := c.Param("commentID")
	commentID, err := strconv.ParseUint(commentIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID format"})
		return
	}

	var comment models.ProjectComment
	if err := database.DB.First(&comment, commentID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve comment", "details": err.Error()})
		}
		return
	}

	userID, ok := middleware.GetUserID(c)
	if !ok || (userID != comment.UserID && !middleware.IsAdmin(c)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to delete this comment"})
		return
	}

	if err := database.DB.Delete(&models.ProjectComment{}, commentID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comment", "details": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
}

func castVote(c *gin.Context) {
	projectIDStr := c.Param("id")
	projectID, err := strconv.ParseUint(projectIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID format"})
		return
	}

	var input struct {
		Vote int `json:"vote" binding:"required"` // 1 or -1
	}
	if err := c.ShouldBindJSON(&input); err != nil || (input.Vote != 1 && input.Vote != -1) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Vote must be 1 (up) or -1 (down)"})
		return
	}

	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	var existing models.ProjectVote
	var project models.Project
	transaction := database.DB.Begin()

	// Lock project row for update, because we need to have synced upvoting/downvoting of users with the 'cache'
	// that we basically have in Project model (by storing upvote/downvote count there, instead of summing up votes)
	if err := transaction.
		Clauses(clause.Locking{Strength: "UPDATE"}).
		First(&project, projectID).Error; err != nil {
		transaction.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	err = transaction.Where("user_id = ? AND project_id = ?", userID, projectID).First(&existing).Error
	if err == nil {
		// User already voted on this type e.g. second upvote
		if existing.Vote == models.VoteType(input.Vote) {
			// Remove vote
			if err := transaction.Delete(&existing).Error; err != nil {
				transaction.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove vote"})
				return
			}
			if input.Vote == 1 {
				project.VotesUp--
			} else {
				project.VotesDown--
			}
			transaction.Save(&project)
			transaction.Commit()
			c.JSON(http.StatusOK, gin.H{
				"message":    "Vote removed",
				"votes_up":   project.VotesUp,
				"votes_down": project.VotesDown,
			})
			return
		} else {
			// Switch vote
			if input.Vote == 1 {
				project.VotesUp++
				project.VotesDown--
			} else {
				project.VotesDown++
				project.VotesUp--
			}
			existing.Vote = models.VoteType(input.Vote)
			if err := transaction.Save(&existing).Error; err != nil {
				transaction.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update vote"})
				return
			}
			transaction.Save(&project)
			transaction.Commit()
			c.JSON(http.StatusOK, gin.H{
				"message":    "Vote updated",
				"votes_up":   project.VotesUp,
				"votes_down": project.VotesDown,
			})
			return
		}
	}

	if err != gorm.ErrRecordNotFound {
		transaction.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Vote lookup failed"})
		return
	}

	// New vote
	newVote := models.ProjectVote{
		UserID:    userID,
		ProjectID: uint(projectID),
		Vote:      models.VoteType(input.Vote),
		CreatedAt: time.Now(),
	}

	if err := transaction.Create(&newVote).Error; err != nil {
		transaction.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cast vote"})
		return
	}

	if input.Vote == 1 {
		project.VotesUp++
	} else {
		project.VotesDown++
	}

	transaction.Save(&project)
	transaction.Commit()
	c.JSON(http.StatusCreated, gin.H{
		"message":    "Vote cast",
		"votes_up":   project.VotesUp,
		"votes_down": project.VotesDown,
	})
}
