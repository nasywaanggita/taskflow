package controllers

import (
    "net/http"
    "taskflow-api/config"
    "taskflow-api/models"
    
    "github.com/gin-gonic/gin"
)

func GetUserTasks(c *gin.Context) {
    userID := c.Param("id")
    status := c.Query("status")
    categoryID := c.Query("category_id")
    
    query := config.DB.Preload("Category").Where("user_id = ?", userID)
    
    if status != "" {
        query = query.Where("status = ?", status)
    }
    
    if categoryID != "" {
        query = query.Where("category_id = ?", categoryID)
    }
    
    var tasks []models.Task
    result := query.Order("created_at DESC").Find(&tasks)
    
    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to fetch tasks",
            "details": result.Error.Error(),
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": tasks,
        "count": len(tasks),
    })
}

func CreateTask(c *gin.Context) {
    var req models.CreateTaskRequest
    
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Invalid request format",
            "details": err.Error(),
        })
        return
    }
    
    // Validate user exists
    var user models.User
    if err := config.DB.First(&user, req.UserID).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "User not found",
        })
        return
    }
    
    // Validate category exists
    var category models.Category
    if err := config.DB.First(&category, req.CategoryID).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Category not found",
        })
        return
    }
    
    task := models.Task{
        Title:       req.Title,
        Description: req.Description,
        Status:      getOrDefault(req.Status, "todo"),
        Priority:    getOrDefault(req.Priority, "medium"),
        UserID:      req.UserID,
        CategoryID:  req.CategoryID,
        Deadline:    req.Deadline,
    }
    
    result := config.DB.Create(&task)
    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to create task",
            "details": result.Error.Error(),
        })
        return
    }
    
    // Reload dengan relations
    config.DB.Preload("Category").Preload("User").First(&task, task.ID)
    
    c.JSON(http.StatusCreated, gin.H{
        "success": true,
        "message": "Task created successfully",
        "data": task,
    })
}

func UpdateTask(c *gin.Context) {
    id := c.Param("id")
    
    var task models.Task
    result := config.DB.Preload("User").First(&task, id)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error": "Task not found",
        })
        return
    }
    
    var req models.UpdateTaskRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Invalid request format",
            "details": err.Error(),
        })
        return
    }
    
    oldStatus := task.Status
    
    // Update fields if provided
    if req.Title != "" {
        task.Title = req.Title
    }
    if req.Description != "" {
        task.Description = req.Description
    }
    if req.Status != "" {
        task.Status = req.Status
    }
    if req.Priority != "" {
        task.Priority = req.Priority
    }
    if req.CategoryID != 0 {
        // Validate category exists
        var category models.Category
        if err := config.DB.First(&category, req.CategoryID).Error; err != nil {
            c.JSON(http.StatusBadRequest, gin.H{
                "error": "Category not found",
            })
            return
        }
        task.CategoryID = req.CategoryID
    }
    if req.Deadline != nil {
        task.Deadline = req.Deadline
    }
    
    config.DB.Save(&task)
    config.DB.Preload("Category").Preload("User").First(&task, task.ID)
    
    // TODO: Send notification if status changed
    if oldStatus != task.Status && (task.Status == "in_progress" || task.Status == "done") {
        // Log for now, implement actual notification later
        c.Header("X-Status-Change", "true")
    }
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "message": "Task updated successfully",
        "data": task,
    })
}

func DeleteTask(c *gin.Context) {
    id := c.Param("id")
    
    result := config.DB.Delete(&models.Task{}, id)
    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to delete task",
            "details": result.Error.Error(),
        })
        return
    }
    
    if result.RowsAffected == 0 {
        c.JSON(http.StatusNotFound, gin.H{
            "error": "Task not found",
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "message": "Task deleted successfully",
    })
}

func getOrDefault(value, defaultValue string) string {
    if value == "" {
        return defaultValue
    }
    return value
}