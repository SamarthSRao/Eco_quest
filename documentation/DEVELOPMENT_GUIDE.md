# Development Guide

This guide provides detailed information for developers working on the Eco-Friendly Activity Tracker project.

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express Backend │    │   MongoDB DB    │
│                 │    │                 │    │                 │
│  - Components   │◄──►│  - API Routes   │◄──►│  - User Data    │
│  - Pages        │    │  - Middleware   │    │  - Activities   │
│  - Services     │    │  - Models       │    │  - Milestones   │
│  - Utils        │    │  - Auth         │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
1. User interacts with React frontend
2. Frontend makes API calls to Express backend
3. Backend validates requests and authenticates users
4. Backend queries/updates MongoDB database
5. Backend returns JSON responses
6. Frontend updates UI based on responses

## 📁 Detailed File Structure

### Backend Structure
```
├── index.js                 # Main server entry point
├── middleware/
│   └── auth.js             # JWT authentication middleware
├── models/
│   ├── User.js             # Main user model with activity tracking
│   ├── userActivity.js     # Legacy activity model (deprecated)
│   └── ninja.js            # Legacy ninja model (deprecated)
├── routes/
│   ├── auth.js             # Authentication routes (/api/auth/*)
│   ├── activity.js         # Activity tracking routes (/api/activity/*)
│   ├── profile.js          # User profile routes (/api/user/*)
│   ├── api.js              # Legacy API routes
│   └── userActivityApi.js  # Legacy user activity API
└── package.json            # Dependencies and scripts
```

### Frontend Structure
```
├── src/
│   ├── App.jsx             # Main app component with routing
│   ├── index.js            # React app entry point
│   ├── index.css           # Global styles
│   ├── components/
│   │   ├── activity/       # Activity-related components
│   │   │   ├── ActivitySubmissionForm.jsx
│   │   │   ├── ActivityHistoryTable.jsx
│   │   │   ├── ActivityStatsDashboard.jsx
│   │   │   └── ActivityRulesDisplay.jsx
│   │   ├── auth/           # Authentication components
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   └── AuthGuard.jsx
│   │   ├── user/           # User profile components
│   │   │   ├── UserProfileDisplay.jsx
│   │   │   ├── ProfileUpdateForm.jsx
│   │   │   ├── MilestonesList.jsx
│   │   │   └── LeaderboardTable.jsx
│   │   ├── icons/          # Reusable icon components
│   │   └── UI/             # Generic UI components
│   ├── pages/              # Main application pages
│   │   ├── LoginPage.jsx
│   │   ├── ActivityDashboard.jsx
│   │   ├── LogActivityPage.jsx
│   │   └── ActivityHistoryPage.jsx
│   ├── services/           # API service layer
│   │   └── api.js          # Centralized API calls
│   └── utils/              # Utility functions
│       └── navigation.js   # Navigation utilities
```

## 🔧 Development Setup

### Prerequisites
- Node.js 14+ 
- MongoDB 4.4+
- Git

### Local Development Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd new1
   npm install
   ```

2. **Environment Configuration**
   Create `.env` file:
   ```env
   JWT_SECRET=development-secret-key
   MONGODB_URI=mongodb://localhost:27017/eco-tracker-dev
   PORT=3000
   NODE_ENV=development
   ```

3. **Database Setup**
   ```bash
   # Start MongoDB (if not running as service)
   mongod
   
   # Or use MongoDB Atlas for cloud database
   ```

4. **Development Server**
   ```bash
   npm run dev  # Starts both webpack watch and server
   ```

### Development Workflow

1. **Feature Development**
   - Create feature branch from main
   - Make changes in appropriate directories
   - Test locally with `npm run dev`
   - Commit with descriptive messages

2. **Code Style**
   - Use ESLint configuration
   - Follow existing naming conventions
   - Add JSDoc comments for functions
   - Use meaningful variable names

3. **Testing Strategy**
   - Test API endpoints with Postman/curl
   - Test frontend components manually
   - Verify responsive design on different screen sizes

## 🗄️ Database Schema

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

### Activity Types Enum
```javascript
const ACTIVITY_TYPES = [
  'cycling',           // 10 points/km
  'running',           // 15 points/km  
  'walking',           // 5 points/km
  'public_transport',  // 30 points/trip
  'recycling',         // 40 points/action
  'tree_planting',     // 100 points/tree
  'energy_saving'      // 25 points/action
];
```

## 🔐 Authentication System

### JWT Token Structure
```javascript
{
  userId: ObjectId,
  iat: Number,    // Issued at
  exp: Number     // Expires at (24h)
}
```

### Authentication Flow
1. User submits login credentials
2. Server validates credentials against database
3. Server generates JWT token with user ID
4. Client stores token in localStorage
5. Client includes token in Authorization header for protected routes
6. Server validates token on each protected request

### Protected Route Middleware
```javascript
const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
```

## 🎯 API Design Patterns

### Response Format
```javascript
// Success Response
{
  message: "Operation successful",
  data: { /* response data */ }
}

// Error Response  
{
  message: "Error description",
  error?: "Additional error details"
}
```

### Pagination
```javascript
// Request
GET /api/activity/history?page=1&limit=10

// Response
{
  activities: [...],
  pagination: {
    currentPage: 1,
    totalPages: 5,
    totalActivities: 50,
    hasNextPage: true,
    hasPrevPage: false
  }
}
```

### Error Handling
```javascript
// Server-side error handling
try {
  // API logic
} catch (error) {
  console.error('Operation error:', error);
  res.status(500).json({ message: 'Internal server error' });
}
```

## 🎨 Frontend Architecture

### Component Structure
```javascript
// Functional component with hooks
const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  const handleEvent = useCallback(() => {
    // Event handling
  }, [dependencies]);
  
  return (
    <div className="tailwind-classes">
      {/* JSX content */}
    </div>
  );
};
```

### State Management
- **Local State**: useState for component-specific data
- **API State**: Custom hooks for API calls
- **Global State**: Context API for user authentication
- **Form State**: Controlled components with validation

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and colors
- Use semantic color names (green for eco-friendly actions)

## 🧪 Testing Guidelines

### API Testing
```bash
# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test activity submission
curl -X POST http://localhost:3000/api/activity/activity \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"cycling","distance":5.2,"description":"Morning ride"}'
```

### Frontend Testing
- Test form validation
- Test API integration
- Test responsive design
- Test user authentication flow
- Test navigation between pages

## 🚀 Deployment Considerations

### Environment Variables
```env
# Production
JWT_SECRET=strong-production-secret
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/eco-tracker
PORT=3000
NODE_ENV=production

# Optional
WEATHER_API_KEY=your-weather-api-key
```

### Build Process
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Security Checklist
- [ ] Strong JWT secret
- [ ] HTTPS in production
- [ ] Input validation
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Error handling without sensitive data

## 🐛 Debugging Tips

### Common Issues
1. **MongoDB Connection**: Check if MongoDB is running
2. **JWT Errors**: Verify token format and expiration
3. **CORS Issues**: Check frontend-backend URL configuration
4. **Build Errors**: Clear node_modules and reinstall

### Debug Tools
- Browser DevTools for frontend debugging
- MongoDB Compass for database inspection
- Postman for API testing
- Console logging for server-side debugging

## 📚 Code Standards

### JavaScript/React
- Use functional components with hooks
- Prefer const over let
- Use meaningful variable names
- Add JSDoc comments for complex functions
- Follow existing code patterns

### CSS/Styling
- Use Tailwind utility classes
- Avoid custom CSS when possible
- Maintain consistent spacing (4, 8, 16, 24px)
- Use semantic color names

### Git Workflow
- Use descriptive commit messages
- Create feature branches
- Keep commits atomic
- Use conventional commit format when possible

## 🔄 Maintenance Tasks

### Regular Updates
- Update dependencies monthly
- Review and update security patches
- Monitor database performance
- Clean up unused code
- Update documentation

### Performance Optimization
- Implement caching for frequently accessed data
- Optimize database queries
- Minimize bundle size
- Use lazy loading for components
- Implement service worker for offline support

---

This development guide should be updated as the project evolves and new patterns emerge.
