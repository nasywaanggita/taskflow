package workers

import (
    "log"
    "taskflow-api/config"
    "taskflow-api/models"
    "taskflow-api/services"
    "time"

    "github.com/robfig/cron/v3"
)

type TaskReminderWorker struct {
    firebaseService *services.FirebaseService
    cron           *cron.Cron
}

func NewTaskReminderWorker() *TaskReminderWorker {
    return &TaskReminderWorker{
        firebaseService: services.NewFirebaseService(),
        cron:           cron.New(cron.WithSeconds()),
    }
}

func (trw *TaskReminderWorker) Start() {
    _, err := trw.cron.AddFunc("0 * * * * *", trw.checkTaskReminders)
    if err != nil {
        log.Printf("❌ Error adding task reminder cron job: %v", err)
        return
    }
    
    trw.cron.Start()
    log.Println("⏰ Task reminder worker started - checking every minute for 5-minute deadline reminders")
}

func (trw *TaskReminderWorker) Stop() {
    if trw.cron != nil {
        trw.cron.Stop()
        log.Println("⏰ Task reminder worker stopped")
    }
}

func (trw *TaskReminderWorker) checkTaskReminders() {
    now := time.Now()
    fiveMinutesLater := now.Add(5 * time.Minute)
    oneMinuteLater := now.Add(1 * time.Minute)
    
    var tasks []models.Task
    err := config.DB.Preload("User").Preload("Category").
        Where("deadline BETWEEN ? AND ?", fiveMinutesLater, oneMinuteLater).
        Where("reminder_sent_at IS NULL").
        Where("status != ?", "done").
        Where("deadline IS NOT NULL").
        Find(&tasks).Error
    
    if err != nil {
        log.Printf("❌ Error fetching tasks for reminders: %v", err)
        return
    }
    
    if len(tasks) == 0 {
        return 
    }
    
    log.Printf("⏰ Found %d tasks needing 5-minute deadline reminders", len(tasks))
    
    successCount := 0
    failCount := 0
    
    for _, task := range tasks {
        if task.User.FCMToken == "" {
            log.Printf("⚠️  User %s has no FCM token, skipping reminder for task: %s", 
                task.User.Email, task.Title)
            continue
        }
        
        err := trw.firebaseService.SendTaskReminder(task, task.User)
        if err != nil {
            log.Printf("❌ Failed to send reminder for task '%s' to user %s: %v", 
                task.Title, task.User.Email, err)
            failCount++
        } else {
            reminderTime := time.Now()
            task.ReminderSentAt = &reminderTime
            config.DB.Save(&task)
            
            log.Printf("✅ 5-minute reminder sent for task: '%s' to %s", 
                task.Title, task.User.Email)
            successCount++
        }
        
        time.Sleep(100 * time.Millisecond)
    }
    
    if successCount > 0 || failCount > 0 {
        log.Printf("📊 Reminder batch completed: %d success, %d failed", successCount, failCount)
    }
}

func (trw *TaskReminderWorker) SendImmediateReminder(taskID uint) error {
    var task models.Task
    err := config.DB.Preload("User").Preload("Category").First(&task, taskID).Error
    if err != nil {
        return err
    }
    
    return trw.firebaseService.SendTaskReminder(task, task.User)
}