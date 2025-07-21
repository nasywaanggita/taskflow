package models

import (
    "time"
)

type Category struct {
    ID          uint      `json:"id" gorm:"primaryKey"`
    Name        string    `json:"name" gorm:"not null"`
    Slug        string    `json:"slug" gorm:"unique;not null"`
    Color       string    `json:"color" gorm:"default:#3B82F6"`
    Description string    `json:"description"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
    
    Tasks       []Task    `json:"tasks,omitempty" gorm:"foreignKey:CategoryID"`
    Users       []User    `json:"users,omitempty" gorm:"many2many:user_categories;"`
}