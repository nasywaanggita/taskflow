package config

import (
    "context"
    "log"
    "os"
    
    firebase "firebase.google.com/go/v4"
    "firebase.google.com/go/v4/messaging"
    "google.golang.org/api/option"
)

var FirebaseApp *firebase.App
var FirebaseMessaging *messaging.Client

func InitFirebase() {
    credentialsPath := getEnvOrDefault("FIREBASE_CREDENTIALS_PATH", "./firebase-credentials.json")
    
    // Check if file exists
    if _, err := os.Stat(credentialsPath); os.IsNotExist(err) {
        log.Printf("⚠️  Firebase credentials file not found: %s", credentialsPath)
        log.Println("Firebase features will be disabled")
        return
    }

    opt := option.WithCredentialsFile(credentialsPath)
    app, err := firebase.NewApp(context.Background(), nil, opt)
    if err != nil {
        log.Printf("⚠️  Error initializing Firebase app: %v", err)
        log.Println("Firebase features will be disabled")
        return
    }

    FirebaseApp = app

    messagingClient, err := app.Messaging(context.Background())
    if err != nil {
        log.Printf("⚠️  Error initializing Firebase messaging: %v", err)
        return
    }

    FirebaseMessaging = messagingClient
    log.Println("✅ Firebase initialized successfully")
}