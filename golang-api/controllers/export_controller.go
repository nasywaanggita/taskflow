package controllers

import (
    "encoding/csv"
    "fmt"
    "net/http"
    "strconv"
    "taskflow-api/config"
    "taskflow-api/models"
    "time"

    "github.com/gin-gonic/gin"
)

func ExportUserTasks(c *gin.Context) {
    userID := c.Param("user_id")

    var tasks []models.Task
    result := config.DB.Where("user_id = ?", userID).
        Preload("Category").
        Find(&tasks)

    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to fetch tasks",
        })
        return
    }

    // Set headers for CSV download
    c.Header("Content-Type", "text/csv")
    c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=my_tasks_%s.csv", time.Now().Format("2006-01-02")))

    writer := csv.NewWriter(c.Writer)
    defer writer.Flush()

    // Write CSV headers
    headers := []string{"ID", "Title", "Description", "Status", "Priority", "Category", "Deadline", "Created Date"}
    writer.Write(headers)

    // Write task data
    for _, task := range tasks {
        deadline := ""
        if task.Deadline != nil {
            deadline = task.Deadline.Format("2006-01-02 15:04:05")
        }

        // Perbaikan di sini: tidak menggunakan `task.Category != nil` karena Category adalah struct
        categoryName := ""
        if task.Category.ID != 0 {
            categoryName = task.Category.Name
        }

        record := []string{
            strconv.Itoa(int(task.ID)),
            task.Title,
            task.Description,
            task.Status,
            task.Priority,
            categoryName,
            deadline,
            task.CreatedAt.Format("2006-01-02 15:04:05"),
        }
        writer.Write(record)
    }
}

func ExportUserTasksJSON(c *gin.Context) {
    userID := c.Param("user_id")

    var tasks []models.Task
    result := config.DB.Where("user_id = ?", userID).
        Preload("Category").
        Find(&tasks)

    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to fetch tasks",
        })
        return
    }

    // Set headers for JSON download
    c.Header("Content-Type", "application/json")
    c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=my_tasks_%s.json", time.Now().Format("2006-01-02")))

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": tasks,
        "exported_at": time.Now(),
        "total_tasks": len(tasks),
    })
}
