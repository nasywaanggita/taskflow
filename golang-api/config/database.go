package config

import (
    "fmt"
    "log"
    "os"
    
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "github.com/joho/godotenv"
)

var DB *gorm.DB

func ConnectDatabase() {
    err := godotenv.Load()
    if err != nil {
        log.Printf("Warning: Error loading .env file: %v", err)
    }

    dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
        getEnvOrDefault("DB_HOST", "localhost"),
        getEnvOrDefault("DB_PORT", "5432"),
        getEnvOrDefault("DB_USER", "postgres"),
        getEnvOrDefault("DB_PASSWORD", ""),
        getEnvOrDefault("DB_NAME", "taskflow"),
        getEnvOrDefault("DB_SSLMODE", "disable"),
    )

    database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    DB = database
    log.Println("✅ Database connected successfully")
}

func getEnvOrDefault(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}