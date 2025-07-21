package controllers

import (
    "net/http"
    "taskflow-api/config"
    "taskflow-api/models"
    
    "github.com/gin-gonic/gin"
)

func GetCategories(c *gin.Context) {
    var categories []models.Category
    result := config.DB.Order("name ASC").Find(&categories)
    
    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to fetch categories",
            "details": result.Error.Error(),
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": categories,
        "count": len(categories),
    })
}

func GetCategoryById(c *gin.Context) {
    id := c.Param("id")
    
    var category models.Category
    result := config.DB.Preload("Tasks").First(&category, id)
    
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error": "Category not found",
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": category,
    })
}