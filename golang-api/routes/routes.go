package routes

import (
    "taskflow-api/controllers"
    "taskflow-api/middleware"

    "github.com/gin-gonic/gin"
)

func SetupRoutes() *gin.Engine {
    gin.SetMode(gin.ReleaseMode)

    r := gin.New()

    // Middlewares
    r.Use(middleware.Logger())
    r.Use(middleware.ErrorHandler())
    r.Use(middleware.CORSMiddleware())

    // Health check
    r.GET("/health", controllers.HealthCheck)
    r.GET("/", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "TaskFlow API Server",
            "version": "1.0.0",
            "status":  "running",
        })
    })

    // Grouped API routes
    api := r.Group("/api")
    {
        // Task routes
        api.GET("/users/:id/tasks", controllers.GetUserTasks)
        api.POST("/tasks", controllers.CreateTask)
        api.PUT("/tasks/:id", controllers.UpdateTask)
        api.DELETE("/tasks/:id", controllers.DeleteTask)

        // Category routes
        api.GET("/categories", controllers.GetCategories)
        api.GET("/categories/:id", controllers.GetCategoryById)

        // Export routes 
        api.GET("/user-tasks/:user_id/export/csv", controllers.ExportUserTasks)
        api.GET("/user-tasks/:user_id/export/json", controllers.ExportUserTasksJSON)

        // User routes
        api.POST("/users", controllers.CreateUser)
        api.GET("/users/:id", controllers.GetUserById)
        api.GET("/users/firebase/:firebase_uid", controllers.GetUserByFirebaseUID)
        api.PUT("/users/:id/fcm-token", controllers.UpdateFCMToken)
        api.PUT("/users/:id", controllers.UpdateProfile)

        // Dashboard
        api.GET("/dashboard/stats", controllers.GetDashboardStats)

        // Weather
        api.GET("/weather", controllers.GetWeatherData)
        api.GET("/weather/multiple", controllers.GetMultipleCitiesWeather)
    }

    return r
}
