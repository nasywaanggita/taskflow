package controllers

import (
    "net/http"
    "taskflow-api/services"
    
    "github.com/gin-gonic/gin"
)

func GetWeatherData(c *gin.Context) {
    city := c.DefaultQuery("city", "Jakarta")
    
    weatherService := services.NewWeatherService()
    weatherData, err := weatherService.GetWeatherData(city)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "success": false,
            "error":   "Failed to fetch weather data",
            "details": err.Error(),
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data":    weatherData,
    })
}

func GetMultipleCitiesWeather(c *gin.Context) {
    // Default Indonesian cities
    defaultCities := []string{"Jakarta", "Bandung", "Surabaya", "Medan", "Semarang"}
    
    weatherService := services.NewWeatherService()
    weatherMap, err := weatherService.GetMultipleCitiesWeather(defaultCities)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "success": false,
            "error":   "Failed to fetch weather data for multiple cities",
            "details": err.Error(),
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data":    weatherMap,
        "count":   len(weatherMap),
    })
}