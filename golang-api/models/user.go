package models

import (
    "time"
    "gorm.io/gorm"
)

type User struct {
    ID          uint           `json:"id" gorm:"primaryKey"`
    Name        string         `json:"name" gorm:"not null"`
    Email       string         `json:"email" gorm:"unique;not null"`
    Password    string         `json:"-" gorm:"default:''"`  // TAMBAHAN: default empty, hide dari JSON
    FirebaseUID string         `json:"firebase_uid"`
    FCMToken    string         `json:"fcm_token"`
    CreatedAt   time.Time      `json:"created_at"`
    UpdatedAt   time.Time      `json:"updated_at"`
    DeletedAt   gorm.DeletedAt `json:"deleted_at" gorm:"index"`
    
    Tasks       []Task         `json:"tasks,omitempty" gorm:"foreignKey:UserID"`
    Categories  []Category     `json:"categories,omitempty" gorm:"many2many:user_categories;"`
}

type CreateUserRequest struct {
    Name        string `json:"name" binding:"required"`
    Email       string `json:"email" binding:"required,email"`
    Password    string `json:"-"` 
    FirebaseUID string `json:"firebase_uid"`
    FCMToken    string `json:"fcm_token"`
}

type UpdateFCMTokenRequest struct {
    FCMToken string `json:"fcm_token" binding:"required"`
}