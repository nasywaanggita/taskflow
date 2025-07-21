package controllers

import (
    "net/http"
    "taskflow-api/config"
    "time"
    
    "github.com/gin-gonic/gin"
)

func HealthCheck(c *gin.Context) {
    // Check database connection
    sqlDB, err := config.DB.DB()
    if err != nil {
        c.JSON(http.StatusServiceUnavailable, gin.H{
            "status":     "unhealthy",
            "database":   "disconnected",
            "timestamp":  time.Now().Format(time.RFC3339),
            "version":    "1.0.0",
        })
        return
    }
    
    if err := sqlDB.Ping(); err != nil {
        c.JSON(http.StatusServiceUnavailable, gin.H{
            "status":     "unhealthy",
            "database":   "ping failed",
            "timestamp":  time.Now().Format(time.RFC3339),
            "version":    "1.0.0",
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "status":     "healthy",
        "database":   "connected",
        "version":    "1.0.0",
        "timestamp":  time.Now().Format(time.RFC3339),
    })
}