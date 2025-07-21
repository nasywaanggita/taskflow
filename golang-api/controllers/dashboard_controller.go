package controllers

import (
    "net/http"
    "taskflow-api/config"
    "taskflow-api/models"
    
    "github.com/gin-gonic/gin"
)

type DashboardStats struct {
    TotalUsers      int64   `json:"total_users"`
    TotalTasks      int64   `json:"total_tasks"`
    CompletedTasks  int64   `json:"completed_tasks"`
    PendingTasks    int64   `json:"pending_tasks"`
    InProgressTasks int64   `json:"in_progress_tasks"`
    CompletionRate  float64 `json:"completion_rate"`
}

type TasksByCategory struct {
    CategoryName string `json:"category_name"`
    TaskCount    int64  `json:"task_count"`
}

type TasksByStatus struct {
    Status    string `json:"status"`
    TaskCount int64  `json:"task_count"`
}

func GetDashboardStats(c *gin.Context) {
    var stats DashboardStats
    
    // Get basic counts
    config.DB.Model(&models.User{}).Count(&stats.TotalUsers)
    config.DB.Model(&models.Task{}).Count(&stats.TotalTasks)
    config.DB.Model(&models.Task{}).Where("status = ?", "done").Count(&stats.CompletedTasks)
    config.DB.Model(&models.Task{}).Where("status = ?", "todo").Count(&stats.PendingTasks)
    config.DB.Model(&models.Task{}).Where("status = ?", "in_progress").Count(&stats.InProgressTasks)
    
    // Calculate completion rate
    if stats.TotalTasks > 0 {
        stats.CompletionRate = float64(stats.CompletedTasks) / float64(stats.TotalTasks) * 100
    }
    
    // Get tasks by category
    var tasksByCategory []TasksByCategory
    config.DB.Table("tasks").
        Select("categories.name as category_name, COUNT(tasks.id) as task_count").
        Joins("JOIN categories ON categories.id = tasks.category_id").
        Where("tasks.deleted_at IS NULL").
        Group("categories.name").
        Scan(&tasksByCategory)
    
    // Get tasks by status
    var tasksByStatus []TasksByStatus
    config.DB.Table("tasks").
        Select("status, COUNT(id) as task_count").
        Where("deleted_at IS NULL").
        Group("status").
        Scan(&tasksByStatus)
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": gin.H{
            "stats":              stats,
            "tasks_by_category":  tasksByCategory,
            "tasks_by_status":    tasksByStatus,
        },
    })
}