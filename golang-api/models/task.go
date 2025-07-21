package models

import (
    "time"
    "gorm.io/gorm"
)

type Task struct {
    ID             uint           `json:"id" gorm:"primaryKey"`
    Title          string         `json:"title" gorm:"not null"`
    Description    string         `json:"description"`
    Status         string         `json:"status" gorm:"default:todo;check:status IN ('todo','in_progress','done')"`
    Priority       string         `json:"priority" gorm:"default:medium;check:priority IN ('low','medium','high')"`
    UserID         uint           `json:"user_id" gorm:"not null"`
    CategoryID     uint           `json:"category_id" gorm:"not null"`
    Deadline       *time.Time     `json:"deadline"`
    ReminderSentAt *time.Time     `json:"reminder_sent_at"`
    CreatedAt      time.Time      `json:"created_at"`
    UpdatedAt      time.Time      `json:"updated_at"`
    DeletedAt      gorm.DeletedAt `json:"deleted_at" gorm:"index"`
    
    User           User           `json:"user,omitempty" gorm:"foreignKey:UserID"`
    Category       Category       `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
}

type CreateTaskRequest struct {
    Title       string     `json:"title" binding:"required"`
    Description string     `json:"description"`
    Status      string     `json:"status"`
    Priority    string     `json:"priority"`
    UserID      uint       `json:"user_id" binding:"required"`
    CategoryID  uint       `json:"category_id" binding:"required"`
    Deadline    *time.Time `json:"deadline"`
}

type UpdateTaskRequest struct {
    Title       string     `json:"title"`
    Description string     `json:"description"`
    Status      string     `json:"status"`
    Priority    string     `json:"priority"`
    CategoryID  uint       `json:"category_id"`
    Deadline    *time.Time `json:"deadline"`
}