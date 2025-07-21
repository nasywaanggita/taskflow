package services

import (
    "context"
    "fmt"
    "log"
    "taskflow-api/config"
    "taskflow-api/models"
    
    "firebase.google.com/go/v4/messaging"
)

type FirebaseService struct{}

func NewFirebaseService() *FirebaseService {
    return &FirebaseService{}
}

// SendTaskReminder - Kirim notifikasi 5 menit sebelum deadline
func (fs *FirebaseService) SendTaskReminder(task models.Task, user models.User) error {
    if config.FirebaseMessaging == nil {
        log.Printf("📱 [MOCK] Would send reminder to %s: Task '%s' is due in 5 minutes!", user.Name, task.Title)
        return nil
    }

    if user.FCMToken == "" {
        return fmt.Errorf("user %s has no FCM token", user.Email)
    }

    message := &messaging.Message{
        Data: map[string]string{
            "task_id":      fmt.Sprintf("%d", task.ID),
            "task_title":   task.Title,
            "user_id":      fmt.Sprintf("%d", task.UserID),
            "category_id":  fmt.Sprintf("%d", task.CategoryID),
            "type":         "task_reminder",
            "action":       "open_task",
        },
        Notification: &messaging.Notification{
            Title: "⏰ Task Reminder - TaskFlow",
            Body:  fmt.Sprintf("Don't forget: %s is due in 5 minutes!", task.Title),
        },
        Android: &messaging.AndroidConfig{
            Notification: &messaging.AndroidNotification{
                Icon:         "ic_notification",
                Color:        "#3B82F6",
                Sound:        "default",
                Priority:     messaging.PriorityHigh,
                ChannelID:    "task_reminders",
            },
        },
        APNS: &messaging.APNSConfig{
            Payload: &messaging.APNSPayload{
                Aps: &messaging.Aps{
                    Alert: &messaging.ApsAlert{
                        Title: "⏰ Task Reminder - TaskFlow",
                        Body:  fmt.Sprintf("Don't forget: %s is due in 5 minutes!", task.Title),
                    },
                    Badge: func() *int { b := 1; return &b }(), // PERBAIKAN: gunakan pointer
                    Sound: "default",
                },
            },
        },
        Token: user.FCMToken,
    }

    response, err := config.FirebaseMessaging.Send(context.Background(), message)
    if err != nil {
        log.Printf("❌ Error sending FCM reminder: %v", err)
        return err
    }

    log.Printf("✅ Task reminder sent successfully: %s", response)
    return nil
}

// SendTaskStatusUpdate - Notifikasi ketika status task berubah
func (fs *FirebaseService) SendTaskStatusUpdate(task models.Task, user models.User, newStatus string) error {
    if config.FirebaseMessaging == nil {
        log.Printf("📱 [MOCK] Would notify %s: Task '%s' is now %s", user.Name, task.Title, newStatus)
        return nil
    }

    if user.FCMToken == "" {
        log.Printf("⚠️  User %s has no FCM token, skipping notification", user.Email)
        return nil
    }

    statusMessages := map[string]string{
        "in_progress": "🚀 Task has been started",
        "done":        "✅ Task has been completed",
        "todo":        "📋 Task has been reset to todo",
    }

    statusIcons := map[string]string{
        "in_progress": "🚀",
        "done":        "✅",
        "todo":        "📋",
    }

    message := &messaging.Message{
        Data: map[string]string{
            "task_id":      fmt.Sprintf("%d", task.ID),
            "task_title":   task.Title,
            "user_id":      fmt.Sprintf("%d", task.UserID),
            "category_id":  fmt.Sprintf("%d", task.CategoryID),
            "new_status":   newStatus,
            "type":         "status_update",
            "action":       "open_task",
        },
        Notification: &messaging.Notification{
            Title: fmt.Sprintf("%s Task Updated", statusIcons[newStatus]),
            Body:  fmt.Sprintf("%s: %s", task.Title, statusMessages[newStatus]),
        },
        Android: &messaging.AndroidConfig{
            Notification: &messaging.AndroidNotification{
                Icon:      "ic_notification",
                Color:     "#10B981",
                Sound:     "default",
                Priority:  messaging.PriorityDefault,
                ChannelID: "task_updates",
            },
        },
        Token: user.FCMToken,
    }

    response, err := config.FirebaseMessaging.Send(context.Background(), message)
    if err != nil {
        log.Printf("❌ Error sending status update: %v", err)
        return err
    }

    log.Printf("✅ Status update notification sent: %s", response)
    return err
}

// SendBulkTaskReminders - Kirim reminder ke multiple users sekaligus
func (fs *FirebaseService) SendBulkTaskReminders(tasks []models.Task) error {
    if config.FirebaseMessaging == nil {
        log.Printf("📱 [MOCK] Would send bulk reminders to %d tasks", len(tasks))
        return nil
    }

    var messages []*messaging.Message
    
    for _, task := range tasks {
        if task.User.FCMToken == "" {
            continue
        }

        message := &messaging.Message{
            Data: map[string]string{
                "task_id":      fmt.Sprintf("%d", task.ID),
                "task_title":   task.Title,
                "type":         "task_reminder",
                "action":       "open_task",
            },
            Notification: &messaging.Notification{
                Title: "⏰ Task Reminder - TaskFlow",
                Body:  fmt.Sprintf("Don't forget: %s is due in 5 minutes!", task.Title),
            },
            Token: task.User.FCMToken,
        }
        
        messages = append(messages, message)
    }

    if len(messages) == 0 {
        log.Println("📱 No valid FCM tokens found for bulk reminders")
        return nil
    }

    // Send in batches of 500 (Firebase limit)
    batchSize := 500
    for i := 0; i < len(messages); i += batchSize {
        end := i + batchSize
        if end > len(messages) {
            end = len(messages)
        }

        batch := messages[i:end]
        response, err := config.FirebaseMessaging.SendEach(context.Background(), batch)
        if err != nil {
            log.Printf("❌ Error sending bulk reminders: %v", err)
            return err
        }

        log.Printf("✅ Bulk reminders sent: %d success, %d failed", 
            response.SuccessCount, response.FailureCount)
    }

    return nil
}