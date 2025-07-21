# TaskFlow 📋
TaskFlow is a comprehensive task management application built with Laravel, Golang, and Next.js, featuring Firebase authentication, real-time notifications, and weather integration.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Laravel       │    │  PostgreSQL  │    │   Golang API    │
│   Admin Panel   │◄──►│   Database   │◄──►│   Server        │
│   :8001         │    │              │    │   :8080         │
└─────────────────┘    └──────────────┘    └─────────────────┘
                                                     ▲
                                                     │
                                            ┌─────────────────┐
                                            │   Next.js Web   │
                                            │   Frontend      │
                                            │   :3000         │
                                            └─────────────────┘
```

## ✨ Features

### 🔐 **Authentication**
- Firebase email/password authentication
- Protected routes with middleware
- User profile management
- JWT token handling

### 📋 **Task Management**
- Create, read, update, delete tasks
- Task categories (Work, Personal, Shopping)
- Status tracking (Todo, In Progress, Done)
- Priority levels (Low, Medium, High)
- Deadline management with reminders

### 📊 **Dashboard & Analytics**
- Real-time task statistics
- Completion rate tracking
- Category-wise distribution
- User activity monitoring

### 🔔 **Push Notifications**
- Task deadline reminders (5 minutes before)
- Status update notifications
- Firebase Cloud Messaging integration

### 🌤️ **Weather Integration**
- Real-time weather data from OpenWeatherMap
- Location-based weather display
- 30-minute automatic sync

### 📤 **Export Functionality**
- Export tasks as CSV or JSON
- Admin dashboard export features
- User data backup options

## 🚀 Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Frontend** | Next.js + TypeScript | 14.x |
| **Backend API** | Golang + Gin + GORM | 1.21 |
| **Admin Panel** | Laravel + PHP | 10.x |
| **Database** | PostgreSQL | 15.x |
| **Authentication** | Firebase Auth | Latest |
| **Styling** | Tailwind CSS | 3.x |
| **State Management** | Zustand | Latest |

## 📦 Quick Start

### Prerequisites

```bash
Node.js 18+
Go 1.19+
PHP 8.1+
PostgreSQL 15+
Composer
```

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/taskflow-project.git
cd taskflow-project
```

### 2️⃣ Database Setup

```bash
# Create PostgreSQL database
createdb taskflowdb

# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=taskflowdb
export DB_USER=postgres
export DB_PASSWORD=your_password
```

### 3️⃣ Laravel Admin Panel

```bash
cd laravel-dashboard

# Install dependencies
composer install

# Environment setup
cp .env.example .env
php artisan key:generate

# Configure database in .env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=taskflowdb
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Run migrations and seeders
php artisan migrate
php artisan db:seed

# Start server
php artisan serve --port=8001
```

**🌐 Admin Panel:** http://localhost:8001

### 4️⃣ Golang API Server

```bash
cd golang-api

# Install dependencies
go mod tidy

# Environment setup
cp .env.example .env

# Configure .env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=taskflowdb
WEATHER_API_KEY=c095bf7882565056a21c585f9ec1be7b
FIREBASE_PROJECT_ID=taskflow-96528

# Start server
go run main.go
```

**🔌 API Server:** http://localhost:8080

### 5️⃣ Next.js Frontend

```bash
cd nextjs-web

# Install dependencies
npm install

# Environment setup
cp .env.example .env.local

# Configure .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD3990f1sBxM-na5ONqDrXgFisgBp6P5gA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=taskflow-96528.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=taskflow-96528
NEXT_PUBLIC_WEATHER_API_KEY=c095bf7882565056a21c585f9ec1be7b

# Start development server
npm run dev
```

**🖥️ Web App:** http://localhost:3000

## 🔧 Configuration

### Firebase Setup

1. Create Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Enable Cloud Messaging
4. Download `firebase-credentials.json` to `golang-api/`
5. Get Web App config for Next.js environment

### OpenWeatherMap API

1. Get free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Add to environment files as `WEATHER_API_KEY`

## 📖 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users` | Create user |
| `GET` | `/api/users/:id/tasks` | Get user tasks |
| `POST` | `/api/tasks` | Create task |
| `PUT` | `/api/tasks/:id` | Update task |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `GET` | `/api/categories` | Get categories |
| `GET` | `/api/dashboard/stats` | Get statistics |
| `GET` | `/api/weather` | Get weather data |

For detailed API documentation, see [API_DOCS.md](./API_DOCS.md)

## 🗄️ Database Schema

### Core Tables

```sql
-- Users
users (id, name, email, firebase_uid, created_at, updated_at)

-- Tasks
tasks (id, title, description, status, priority, user_id, category_id, deadline, created_at, updated_at)

-- Categories
categories (id, name, color, created_at, updated_at)

-- User Categories (Many-to-Many)
user_categories (user_id, category_id, created_at, updated_at)
```
