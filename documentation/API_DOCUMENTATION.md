# MongoDB Backend API Documentation

## Overview
This backend provides a comprehensive user-based rewards system with MongoDB integration. Users can register, track activities, earn points, and achieve milestones.

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```
    
## API Endpoints

### 🔐 Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "points": 0,
    "milestones": [...],
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "points": 150,
    "milestones": [...],
    "lastLogin": "2025-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

### 📊 Activity Tracking

#### Submit Activity
```http
POST /api/activity/activity
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "cycling",
  "distance": 5.2,
  "description": "Morning bike ride to work"
}
```

**Activity Types:**
- `cycling` - 10 points per km
- `running` - 15 points per km
- `walking` - 5 points per km
- `public_transport` - 30 points per trip
- `recycling` - 40 points per action
- `tree_planting` - 100 points per tree
- `energy_saving` - 25 points per action

**Response:**
```json
{
  "message": "Activity recorded successfully",
  "activity": {
    "type": "cycling",
    "distance": 5.2,
    "pointsEarned": 52,
    "description": "Morning bike ride to work",
    "date": "2024-01-01T00:00:00.000Z"
  },
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "points": 202,
    "milestones": [...]
  }
}
```

#### Get Activity History
```http
GET /api/activity/history?page=1&limit=10&type=cycling&sortBy=date&sortOrder=desc
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `type` - Filter by activity type
- `sortBy` - Sort by: `date`, `points`, `distance`
- `sortOrder` - `asc` or `desc`

#### Get Activity Statistics
```http
GET /api/activity/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalActivities": 25,
  "totalPoints": 1250,
  "totalDistance": 45.5,
  "activitiesByType": {
    "cycling": {
      "count": 10,
      "totalPoints": 520,
      "totalDistance": 52.0
    },
    "walking": {
      "count": 15,
      "totalPoints": 225,
      "totalDistance": 45.0
    }
  },
  "recentActivities": [...],
  "milestones": [...]
}
```

#### Get Points Rules
```http
GET /api/activity/rules
```

### 👤 User Profile

#### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "points": 1250,
  "milestones": [...],
  "totalActivities": 25,
  "achievedMilestones": 2,
  "totalMilestones": 5,
  "nextMilestone": {
    "name": "Eco Champion",
    "target": 1000,
    "pointsNeeded": 0,
    "progress": 100
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastLogin": "2024-01-01T00:00:00.000Z"
}
```

#### Get Activity Log
```http
GET /api/user/activitylog?page=1&limit=20&type=cycling&sortBy=date&sortOrder=desc
Authorization: Bearer <token>
```

#### Get Milestones
```http
GET /api/user/milestones
Authorization: Bearer <token>
```

**Response:**
```json
{
  "milestones": [
    {
      "name": "First Steps",
      "target": 100,
      "isAchieved": true,
      "dateAchieved": "2024-01-01T00:00:00.000Z",
      "progress": 100,
      "pointsNeeded": 0
    }
  ],
  "summary": {
    "achieved": 2,
    "total": 5,
    "progress": 40
  }
}
```

#### Update Profile
```http
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com"
}
```

#### Get Leaderboard
```http
GET /api/user/leaderboard?limit=10
```

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "email": "topuser@example.com",
      "points": 5000,
      "joinedDate": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalUsers": 10
}
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  points: Number (default: 0),
  milestones: [{
    name: String,
    target: Number,
    isAchieved: Boolean,
    dateAchieved: Date
  }],
  activityLog: [{
    type: String (enum),
    distance: Number,
    pointsEarned: Number,
    date: Date,
    description: String
  }],
  createdAt: Date,
  lastLogin: Date
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a `message` field with details:
```json
{
  "message": "Error description"
}
```

## Getting Started

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Register a new user:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. **Login and get token:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

4. **Submit an activity:**
   ```bash
   curl -X POST http://localhost:3000/api/activity/activity \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"type":"cycling","distance":5.2,"description":"Morning ride"}'
   ```

## Environment Variables

Set these environment variables for production:
- `JWT_SECRET` - Secret key for JWT tokens
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 3000)
