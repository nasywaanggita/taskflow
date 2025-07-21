package models

import (
    "time"
    "gorm.io/gorm"
)

type ExternalDataSync struct {
    ID            uint           `json:"id" gorm:"primaryKey"`
    Source        string         `json:"source" gorm:"not null"`
    LastSyncAt    *time.Time     `json:"last_sync_at"`
    Status        string         `json:"status" gorm:"default:pending;check:status IN ('pending','success','failed')"`
    ErrorMessage  string         `json:"error_message"`
    RecordsSynced int            `json:"records_synced" gorm:"default:0"`
    CreatedAt     time.Time      `json:"created_at"`
    UpdatedAt     time.Time      `json:"updated_at"`
    DeletedAt     gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}