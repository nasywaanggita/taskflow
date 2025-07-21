package services

import (
    "encoding/json"
    "fmt"
    "io"
    "log"  
    "net/http"
    "os"
    "strings"
    "time"
)


type WeatherData struct {
    Location     string    `json:"location"`
    Country      string    `json:"country"`
    Temperature  float64   `json:"temperature"`
    FeelsLike    float64   `json:"feels_like"`
    Description  string    `json:"description"`
    Humidity     int       `json:"humidity"`
    Pressure     int       `json:"pressure"`
    WindSpeed    float64   `json:"wind_speed"`
    WindDeg      int       `json:"wind_deg"`
    Visibility   int       `json:"visibility"`
    Clouds       int       `json:"clouds"`
    Icon         string    `json:"icon"`
    Timestamp    time.Time `json:"timestamp"`
    Sunrise      time.Time `json:"sunrise"`
    Sunset       time.Time `json:"sunset"`
}

type OpenWeatherResponse struct {
    Name string `json:"name"`
    Sys  struct {
        Country string `json:"country"`
        Sunrise int64  `json:"sunrise"`
        Sunset  int64  `json:"sunset"`
    } `json:"sys"`
    Main struct {
        Temp      float64 `json:"temp"`
        FeelsLike float64 `json:"feels_like"`
        Humidity  int     `json:"humidity"`
        Pressure  int     `json:"pressure"`
    } `json:"main"`
    Weather []struct {
        Description string `json:"description"`
        Main        string `json:"main"`
        Icon        string `json:"icon"`
    } `json:"weather"`
    Wind struct {
        Speed float64 `json:"speed"`
        Deg   int     `json:"deg"`
    } `json:"wind"`
    Visibility int `json:"visibility"`
    Clouds struct {
        All int `json:"all"`
    } `json:"clouds"`
    Dt int64 `json:"dt"`
}

type WeatherService struct {
    apiKey  string
    baseURL string
    client  *http.Client
}

func NewWeatherService() *WeatherService {
    return &WeatherService{
        apiKey:  os.Getenv("WEATHER_API_KEY"),
        baseURL: getEnvOrDefault("WEATHER_BASE_URL", "https://api.openweathermap.org/data/2.5"),
        client:  &http.Client{Timeout: 10 * time.Second},
    }
}

func (ws *WeatherService) GetWeatherData(city string) (*WeatherData, error) {
    apiKey := os.Getenv("WEATHER_API_KEY")
    if apiKey == "" {
        return nil, fmt.Errorf("weather API key not configured")
    }

    // Clean city name
    city = strings.TrimSpace(city)
    if city == "" {
        return nil, fmt.Errorf("city name cannot be empty")
    }

    url := fmt.Sprintf("%s/weather?q=%s&appid=%s&units=metric", ws.baseURL, city, ws.apiKey)

    resp, err := ws.client.Get(url)
    if err != nil {
        return nil, fmt.Errorf("failed to fetch weather data for %s: %v", city, err)
    }
    defer resp.Body.Close()

    if resp.StatusCode == 404 {
        return nil, fmt.Errorf("city '%s' not found", city)
    }

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("weather API returned status %d for city %s", resp.StatusCode, city)
    }

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return nil, fmt.Errorf("failed to read response body: %v", err)
    }

    var weatherResp OpenWeatherResponse
    if err := json.Unmarshal(body, &weatherResp); err != nil {
        return nil, fmt.Errorf("failed to parse weather data: %v", err)
    }

    return ws.convertToWeatherData(weatherResp), nil
}

func (ws *WeatherService) GetMultipleCitiesWeather(cities []string) (map[string]*WeatherData, error) {
    results := make(map[string]*WeatherData)
    
    for _, city := range cities {
        if city == "" {
            continue
        }
        
        weather, err := ws.GetWeatherData(city)
        if err != nil {
            log.Printf("❌ Failed to get weather for %s: %v", city, err)
            continue
        }
        
        results[city] = weather
        
        time.Sleep(100 * time.Millisecond)
    }
    
    return results, nil
}

func (ws *WeatherService) convertToWeatherData(resp OpenWeatherResponse) *WeatherData {
    description := "Clear"
    icon := "01d"
    if len(resp.Weather) > 0 {
        description = strings.Title(resp.Weather[0].Description)
        icon = resp.Weather[0].Icon
    }

    return &WeatherData{
        Location:    resp.Name,
        Country:     resp.Sys.Country,
        Temperature: resp.Main.Temp,
        FeelsLike:   resp.Main.FeelsLike,
        Description: description,
        Humidity:    resp.Main.Humidity,
        Pressure:    resp.Main.Pressure,
        WindSpeed:   resp.Wind.Speed,
        WindDeg:     resp.Wind.Deg,
        Visibility:  resp.Visibility,
        Clouds:      resp.Clouds.All,
        Icon:        icon,
        Timestamp:   time.Unix(resp.Dt, 0),
        Sunrise:     time.Unix(resp.Sys.Sunrise, 0),
        Sunset:      time.Unix(resp.Sys.Sunset, 0),
    }
}

func (ws *WeatherService) getMockWeatherData(city string) *WeatherData {
    mockData := map[string]*WeatherData{
        "Jakarta": {
            Location:    "Jakarta",
            Country:     "ID",
            Temperature: 28.5,
            FeelsLike:   32.1,
            Description: "Partly Cloudy",
            Humidity:    75,
            Pressure:    1013,
            WindSpeed:   5.2,
            WindDeg:     180,
            Visibility:  10000,
            Clouds:      40,
            Icon:        "02d",
            Timestamp:   time.Now(),
            Sunrise:     time.Now().Add(-2 * time.Hour),
            Sunset:      time.Now().Add(8 * time.Hour),
        },
        "Bandung": {
            Location:    "Bandung",
            Country:     "ID",
            Temperature: 24.8,
            FeelsLike:   26.3,
            Description: "Clear Sky",
            Humidity:    68,
            Pressure:    1015,
            WindSpeed:   3.1,
            WindDeg:     90,
            Visibility:  10000,
            Clouds:      5,
            Icon:        "01d",
            Timestamp:   time.Now(),
            Sunrise:     time.Now().Add(-2 * time.Hour),
            Sunset:      time.Now().Add(8 * time.Hour),
        },
    }

    if data, exists := mockData[city]; exists {
        return data
    }

    return &WeatherData{
        Location:    city,
        Country:     "ID",
        Temperature: 27.0,
        FeelsLike:   29.5,
        Description: "Clear Sky",
        Humidity:    70,
        Pressure:    1013,
        WindSpeed:   4.0,
        WindDeg:     120,
        Visibility:  10000,
        Clouds:      20,
        Icon:        "01d",
        Timestamp:   time.Now(),
        Sunrise:     time.Now().Add(-2 * time.Hour),
        Sunset:      time.Now().Add(8 * time.Hour),
    }
}

func getEnvOrDefault(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}