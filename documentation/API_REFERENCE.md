# API Reference

Complete reference for the Eco-Friendly Activity Tracker REST API.

## 🌐 Base URL
```
http://localhost:3000
```

## 🔐 Authentication

Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📊 Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "Additional error details (optional)"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/api/auth/register`

Creates a new user account with default milestones.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "user@example.com",
    "points": 0,
    "milestones": [
      {
        "name": "First Steps",
        "target": 100,
        "isAchieved": false,
        "dateAchieved": null
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Email and password are required
- `400` - Password must be at least 6 characters long
- `400` - User already exists with this email

### Login User
**POST** `/api/auth/login`

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "user@example.com",
    "points": 150,
    "milestones": [...],
    "lastLogin": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Email and password are required
- `401` - Invalid email or password

---

## 📊 Activity Tracking Endpoints

### Submit Activity
**POST** `/api/activity/activity`

Records a new activity and updates user points.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
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

**Response (200):**
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
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "user@example.com",
    "points": 202,
    "milestones": [...]
  }
}
```

**Error Responses:**
- `400` - Activity type is required
- `400` - Invalid activity type
- `401` - Access token required
- `403` - Invalid or expired token

### Get Activity History
**GET** `/api/activity/history`

Retrieves paginated activity history for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `type` (optional) - Filter by activity type

**Example Request:**
```
GET /api/activity/history?page=1&limit=10&type=cycling
```

**Response (200):**
```json
{
  "activities": [
    {
      "type": "cycling",
      "distance": 5.2,
      "pointsEarned": 52,
      "description": "Morning bike ride",
      "date": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalActivities": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Activity Statistics
**GET** `/api/activity/stats`

Retrieves comprehensive activity statistics for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
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
  "recentActivities": [
    {
      "type": "cycling",
      "distance": 5.2,
      "pointsEarned": 52,
      "description": "Morning ride",
      "date": "2024-01-01T00:00:00.000Z"
    }
  ],
  "milestones": [...]
}
```

### Get Activity Rules
**GET** `/api/activity/rules`

Retrieves points calculation rules for all activity types.

**Response (200):**
```json
{
  "message": "Points calculation rules",
  "rules": [
    {
      "type": "cycling",
      "unit": "kilometer",
      "pointsPerUnit": 10,
      "description": "10 points per kilometer"
    },
    {
      "type": "running",
      "unit": "kilometer",
      "pointsPerUnit": 15,
      "description": "15 points per kilometer"
    },
    {
      "type": "walking",
      "unit": "kilometer",
      "pointsPerUnit": 5,
      "description": "5 points per kilometer"
    },
    {
      "type": "public_transport",
      "unit": "trip",
      "points": 30,
      "description": "30 points per trip"
    },
    {
      "type": "recycling",
      "unit": "action",
      "points": 40,
      "description": "40 points per action"
    },
    {
      "type": "tree_planting",
      "unit": "tree",
      "points": 100,
      "description": "100 points per tree"
    },
    {
      "type": "energy_saving",
      "unit": "action",
      "points": 25,
      "description": "25 points per action"
    }
  ]
}
```

---

## 👤 User Profile Endpoints

### Get User Profile
**GET** `/api/user/profile`

Retrieves comprehensive user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "email": "user@example.com",
  "points": 1250,
  "milestones": [
    {
      "name": "First Steps",
      "target": 100,
      "isAchieved": true,
      "dateAchieved": "2024-01-01T00:00:00.000Z"
    }
  ],
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

### Update User Profile
**PUT** `/api/user/profile`

Updates user profile information (currently email only).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newemail@example.com"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "newemail@example.com",
    "points": 1250
  }
}
```

**Error Responses:**
- `400` - Email is required
- `400` - Email is already taken

### Get Activity Log
**GET** `/api/user/activitylog`

Retrieves detailed activity log with advanced filtering and sorting.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `type` (optional) - Filter by activity type
- `sortBy` (optional) - Sort by: `date`, `points`, `distance` (default: `date`)
- `sortOrder` (optional) - `asc` or `desc` (default: `desc`)

**Example Request:**
```
GET /api/user/activitylog?page=1&limit=20&type=cycling&sortBy=points&sortOrder=desc
```

**Response (200):**
```json
{
  "activities": [
    {
      "type": "cycling",
      "distance": 10.5,
      "pointsEarned": 105,
      "description": "Long weekend ride",
      "date": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalActivities": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "type": "cycling",
    "sortBy": "points",
    "sortOrder": "desc"
  }
}
```

### Get Milestones
**GET** `/api/user/milestones`

Retrieves user's milestone progress and achievements.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
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
    },
    {
      "name": "Green Warrior",
      "target": 500,
      "isAchieved": false,
      "dateAchieved": null,
      "progress": 60,
      "pointsNeeded": 200
    }
  ],
  "summary": {
    "achieved": 1,
    "total": 5,
    "progress": 20
  }
}
```

### Get Leaderboard
**GET** `/api/user/leaderboard`

Retrieves leaderboard of top users by points.

**Query Parameters:**
- `limit` (optional) - Number of users to return (default: 10)

**Example Request:**
```
GET /api/user/leaderboard?limit=20
```

**Response (200):**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "email": "topuser@example.com",
      "points": 5000,
      "joinedDate": "2024-01-01T00:00:00.000Z"
    },
    {
      "rank": 2,
      "email": "seconduser@example.com",
      "points": 4500,
      "joinedDate": "2024-01-02T00:00:00.000Z"
    }
  ],
  "totalUsers": 20
}
```

---

## 🌤️ Weather Endpoints (Bonus Features)

### Get Weather Forecast
**GET** `/api/weather`

Retrieves 7-day weather forecast for Bengaluru.

**Response (200):**
```json
{
  "location": {
    "name": "Bengaluru",
    "country": "India"
  },
  "forecast": {
    "forecastday": [
      {
        "date": "2024-01-01",
        "day": {
          "maxtemp_c": 28,
          "mintemp_c": 18,
          "condition": {
            "text": "Partly cloudy"
          }
        }
      }
    ]
  }
}
```

### Get Current Temperature
**GET** `/api/temperature`

Retrieves current temperature for a specified city.

**Query Parameters:**
- `city` (optional) - City name (default: "Bengaluru")

**Example Request:**
```
GET /api/temperature?city=Mumbai
```

**Response (200):**
```json
{
  "city": "Mumbai",
  "country": "India",
  "temperature": 32,
  "temperature_f": 89.6,
  "condition": "Sunny",
  "humidity": 65,
  "wind_speed": 12,
  "last_updated": "2024-01-01 12:00"
}
```

---

## 🔧 Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "message": "Validation error description"
}
```

**401 Unauthorized:**
```json
{
  "message": "Access token required"
}
```

**403 Forbidden:**
```json
{
  "message": "Invalid or expired token"
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Internal server error"
}
```

### Validation Errors

**Activity Type Validation:**
```json
{
  "message": "Invalid activity type",
  "validTypes": ["cycling", "running", "walking", "public_transport", "recycling", "tree_planting", "energy_saving"]
}
```

**Email Validation:**
```json
{
  "message": "Email is already taken"
}
```

---

## 📝 Example Usage

### Complete Authentication Flow

1. **Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

2. **Login and get token:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

3. **Submit an activity:**
```bash
curl -X POST http://localhost:3000/api/activity/activity \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"type":"cycling","distance":5.2,"description":"Morning ride"}'
```

4. **Get activity history:**
```bash
curl -X GET http://localhost:3000/api/activity/history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

5. **Get user profile:**
```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### JavaScript/Fetch Examples

**Submit Activity:**
```javascript
const submitActivity = async (activityData) => {
  const response = await fetch('/api/activity/activity', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(activityData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit activity');
  }
  
  return response.json();
};
```

**Get Activity Stats:**
```javascript
const getActivityStats = async () => {
  const response = await fetch('/api/activity/stats', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

---

## 🔒 Security Considerations

### JWT Token Security
- Tokens expire after 24 hours
- Store tokens securely (localStorage/sessionStorage)
- Include token in Authorization header for protected routes
- Implement token refresh mechanism for production

### Input Validation
- All inputs are validated on the server
- Email format validation
- Password minimum length (6 characters)
- Activity type validation against allowed values
- Distance validation for distance-based activities

### Rate Limiting
- Consider implementing rate limiting for production
- Protect against brute force attacks
- Limit API calls per user/IP

---

This API reference should be updated as new endpoints are added or existing ones are modified.
