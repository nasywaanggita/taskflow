package workers

import (
    "log"
    "taskflow-api/config"
    "taskflow-api/models"
    "taskflow-api/services"
    "time"

    "github.com/robfig/cron/v3"
)

type WeatherSyncWorker struct {
    weatherService *services.WeatherService
    cron          *cron.Cron
}

func NewWeatherSyncWorker() *WeatherSyncWorker {
    return &WeatherSyncWorker{
        weatherService: services.NewWeatherService(),
        cron:          cron.New(cron.WithSeconds()), // Enable seconds for testing
    }
}

func (wsw *WeatherSyncWorker) Start() {

    _, err := wsw.cron.AddFunc("0 */30 * * * *", wsw.syncWeatherData)
    if err != nil {
        log.Printf("❌ Error adding weather sync cron job: %v", err)
        return
    }
    
    wsw.cron.Start()
    log.Println("🌤️  Weather sync worker started - syncing every 30 minutes")
    
  
    go wsw.syncWeatherData()
}

func (wsw *WeatherSyncWorker) Stop() {
    if wsw.cron != nil {
        wsw.cron.Stop()
        log.Println("🌤️  Weather sync worker stopped")
    }
}

func (wsw *WeatherSyncWorker) syncWeatherData() {
    log.Println("🌤️  [SCHEDULER] Starting weather data sync...")
    
   
    cities := []string{"Jakarta", "Bandung", "Surabaya", "Medan", "Semarang", "Yogyakarta", "Denpasar"}
    
    var syncRecord models.ExternalDataSync
    config.DB.FirstOrCreate(&syncRecord, models.ExternalDataSync{Source: "weather"})
    
 
    syncRecord.Status = "pending"
    syncRecord.ErrorMessage = ""
    config.DB.Save(&syncRecord)
    
  
    weatherMap, err := wsw.weatherService.GetMultipleCitiesWeather(cities)
    if err != nil {
        log.Printf("❌ Weather sync failed: %v", err)
        syncRecord.Status = "failed"
        syncRecord.ErrorMessage = err.Error()
        config.DB.Save(&syncRecord)
        return
    }
    
    recordsSynced := 0
    for city, weatherData := range weatherMap {
        if weatherData != nil {
            log.Printf("🌤️  %s: %.1f°C, %s, Humidity: %d%%, Wind: %.1f m/s", 
                city, weatherData.Temperature, weatherData.Description, 
                weatherData.Humidity, weatherData.WindSpeed)
            recordsSynced++
        }
    }
    
    now := time.Now()
    syncRecord.LastSyncAt = &now
    syncRecord.Status = "success"
    syncRecord.ErrorMessage = ""
    syncRecord.RecordsSynced = recordsSynced
    config.DB.Save(&syncRecord)
    
    log.Printf("✅ Weather sync completed successfully - %d cities synced", recordsSynced)
}

func (wsw *WeatherSyncWorker) ManualSync() error {
    log.Println("🌤️  [MANUAL] Manual weather sync triggered")
    wsw.syncWeatherData()
    return nil
}