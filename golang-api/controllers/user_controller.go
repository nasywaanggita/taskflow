package controllers

import (
    "net/http"
    "taskflow-api/config"
    "taskflow-api/models"
    
    "github.com/gin-gonic/gin"
)

func CreateUser(c *gin.Context) {
    var req models.CreateUserRequest
    
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Invalid request format",
            "details": err.Error(),
        })
        return
    }
    
    user := models.User{
        Name:        req.Name,
        Email:       req.Email,
        FirebaseUID: req.FirebaseUID,
        FCMToken:    req.FCMToken,
    }
    
    // Set password if provided
    if req.Password != "" {
        user.Password = req.Password
    }
    
    result := config.DB.Create(&user)
    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to create user",
            "details": result.Error.Error(),
        })
        return
    }
    
    c.JSON(http.StatusCreated, gin.H{
        "success": true,
        "message": "User created successfully",
        "data": user,
    })
}

func GetUserByFirebaseUID(c *gin.Context) {
    firebaseUID := c.Param("firebase_uid")
    
    var user models.User
    result := config.DB.Where("firebase_uid = ?", firebaseUID).First(&user)
    
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error": "User not found",
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": user,
    })
}

func UpdateFCMToken(c *gin.Context) {
    userID := c.Param("id")
    
    var req models.UpdateFCMTokenRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Invalid request format",
            "details": err.Error(),
        })
        return
    }
    
    var user models.User
    result := config.DB.First(&user, userID)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error": "User not found",
        })
        return
    }
    
    user.FCMToken = req.FCMToken
    config.DB.Save(&user)
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "message": "FCM token updated successfully",
        "data": user,
    })
}

func GetUserById(c *gin.Context) {
    userID := c.Param("id")
    
    var user models.User
    result := config.DB.Preload("Tasks").Preload("Categories").First(&user, userID)
    
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error": "User not found",
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": user,
    })
}

func UpdateProfile(c *gin.Context) {
    userID := c.Param("id")
    
    var req struct {
        Name  string `json:"name"`
        Email string `json:"email"`
    }
    
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Invalid request format",
            "details": err.Error(),
        })
        return
    }
    
    var user models.User
    result := config.DB.First(&user, userID)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error": "User not found",
        })
        return
    }
    
    if req.Name != "" {
        user.Name = req.Name
    }
    if req.Email != "" {
        user.Email = req.Email
    }
    
    config.DB.Save(&user)
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "message": "Profile updated successfully",
        "data": user,
    })
}