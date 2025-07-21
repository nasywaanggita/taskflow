package middleware

import (
    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    "time"
)

func CORSMiddleware() gin.HandlerFunc {
    config := cors.Config{
        AllowOrigins:     []string{"http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept", "X-Requested-With"},
        ExposeHeaders:    []string{"Content-Length", "X-Status-Change"},
        AllowCredentials: true,
        MaxAge:          12 * time.Hour,
    }
    
    return cors.New(config)
}