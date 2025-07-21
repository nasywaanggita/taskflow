package middleware

import (
    "log"
    "net/http"
    
    "github.com/gin-gonic/gin"
)

func ErrorHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        defer func() {
            if err := recover(); err != nil {
                log.Printf("🚨 Panic recovered: %v", err)
                c.JSON(http.StatusInternalServerError, gin.H{
                    "error": "Internal server error",
                    "success": false,
                })
                c.Abort()
            }
        }()
        
        c.Next()
        
        // Handle errors from handlers
        if len(c.Errors) > 0 {
            err := c.Errors.Last()
            log.Printf("🚨 Request error: %v", err)
            
            switch err.Type {
            case gin.ErrorTypeBind:
                c.JSON(http.StatusBadRequest, gin.H{
                    "error": "Invalid request format",
                    "details": err.Error(),
                    "success": false,
                })
            default:
                c.JSON(http.StatusInternalServerError, gin.H{
                    "error": "Something went wrong",
                    "success": false,
                })
            }
        }
    }
}