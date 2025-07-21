package main

import (
    "log"
    "os"
    "os/signal"
    "syscall"
    "taskflow-api/config"
    "taskflow-api/models"
    "taskflow-api/routes"
    "taskflow-api/workers"
    
    "github.com/joho/godotenv"
)

func main() {
    log.Println("🚀 Starting TaskFlow API Server...")
    err := godotenv.Load()
    if err != nil {
        log.Printf("⚠️  Warning: Error loading .env file: %v", err)
        log.Println("Using system environment variables")
    }
    
    config.ConnectDatabase()
    config.InitFirebase()
    
    log.Println("🗄️  Running database migrations...")
    err = config.DB.AutoMigrate(
        &models.User{},
        &models.Category{},
        &models.Task{},
        &models.ExternalDataSync{},
    )
    if err != nil {
        log.Fatal("❌ Failed to migrate database:", err)
    }
    log.Println("✅ Database migrations completed")
    
    seedDefaultCategories()
    
    log.Println("⚙️  Starting background workers...")
    taskReminderWorker := workers.NewTaskReminderWorker()
    taskReminderWorker.Start()
    
    weatherSyncWorker := workers.NewWeatherSyncWorker()
    weatherSyncWorker.Start()
    
    router := routes.SetupRoutes()
    
    // Start server
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    
    log.Printf("🌐 Server starting on port %s", port)
    log.Printf("🔗 API Base URL: http://localhost:%s/api", port)
    log.Printf("🔗 Health Check: http://localhost:%s/health", port)
    
    go func() {
        if err := router.Run(":" + port); err != nil {
            log.Fatal("❌ Failed to start server:", err)
        }
    }()
    
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit
    
    log.Println("🛑 Shutting down server...")
    taskReminderWorker.Stop()
    weatherSyncWorker.Stop()
    log.Println("✅ Server stopped gracefully")
}

func seedDefaultCategories() {
    var count int64
    config.DB.Model(&models.Category{}).Count(&count)
    
    if count > 0 {
        log.Println("📋 Categories already exist, skipping seed")
        return
    }
    
    log.Println("📋 Seeding default categories...")
    
    categories := []models.Category{
        {Name: "Work", Slug: "work", Color: "#3B82F6", Description: "Work related tasks"},
        {Name: "Personal", Slug: "personal", Color: "#10B981", Description: "Personal tasks and activities"},
        {Name: "Shopping", Slug: "shopping", Color: "#F59E0B", Description: "Shopping lists and errands"},
        {Name: "Health", Slug: "health", Color: "#EF4444", Description: "Health and fitness activities"},
        {Name: "Learning", Slug: "learning", Color: "#8B5CF6", Description: "Learning and education"},
    }
    
    for _, category := range categories {
        result := config.DB.Create(&category)
        if result.Error != nil {
            log.Printf("⚠️  Error creating category %s: %v", category.Name, result.Error)
        } else {
            log.Printf("✅ Created category: %s", category.Name)
        }
    }
}