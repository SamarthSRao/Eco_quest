# Eco-Friendly Activity Tracker & Rewards System

A full-stack web application that encourages sustainable living through activity tracking, points-based rewards, and milestone achievements. Users can log various eco-friendly activities, earn points, and compete on leaderboards.

##  Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Activity Tracking**: Log various eco-friendly activities (cycling, running, walking, public transport, recycling, tree planting, energy saving)
- **Points System**: Earn points based on activity type and distance
- **Milestones**: Achieve environmental milestones as you accumulate points
- **Leaderboard**: Compete with other users for the top spots
- **Activity History**: View detailed history of all logged activities
- **Statistics Dashboard**: Comprehensive analytics of your eco-friendly journey
- **Weather Integration**: Current temperature and weather forecast data
- **Responsive Design**: Modern UI built with React and Tailwind CSS

##  Architecture

### Backend (Node.js + Express)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API**: RESTful API with comprehensive error handling
- **Middleware**: Custom authentication middleware for protected routes

### Frontend (React)
- **Framework**: React 18 with React Router for navigation
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks for local state management
- **API Integration**: Axios for HTTP requests
- **Build Tool**: Webpack for bundling

##  Project Structure

```
├── src/                          # Frontend React application
│   ├── components/               # Reusable React components
│   │   ├── activity/            # Activity-related components
│   │   ├── auth/                # Authentication components
│   │   ├── user/                # User profile components
│   │   └── UI/                  # Generic UI components
│   ├── pages/                   # Main application pages
│   ├── services/                # API service layer
│   └── utils/                   # Utility functions
├── routes/                      # Backend API routes
│   ├── auth.js                  # Authentication endpoints
│   ├── activity.js              # Activity tracking endpoints
│   └── profile.js               # User profile endpoints
├── models/                      # MongoDB data models
│   ├── User.js                  # User schema with activity tracking
│   ├── userActivity.js          # Legacy activity model
│   └── ninja.js                 # Legacy ninja model
├── middleware/                  # Express middleware
│   └── auth.js                  # JWT authentication middleware
├── documentation/               # Project documentation
│   ├── DEVELOPMENT_GUIDE.md     # Developer documentation
│   ├── COMPONENT_DOCUMENTATION.md # React components guide
│   ├── API_REFERENCE.md         # Complete API documentation
│   └── API_DOCUMENTATION.md     # Original API documentation
├── public/                      # Static assets
└── dist/                        # Built application files
```

##  Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd new1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   JWT_SECRET=your-super-secret-jwt-key
   MONGODB_URI=mongodb://localhost:27017/eco-tracker
   PORT=3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system

5. **Build and start the application**
   ```bash
   # Development mode (with hot reload)
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

##  Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the frontend for production
- `npm test` - Run tests (currently not implemented)

##  Activity Types & Points System

| Activity Type | Points Calculation | Description |
|---------------|-------------------|-------------|
| Cycling | 10 points/km | Environmentally friendly transportation |
| Running | 15 points/km | Healthy exercise and zero emissions |
| Walking | 5 points/km | Sustainable short-distance travel |
| Public Transport | 30 points/trip | Reduced carbon footprint |
| Recycling | 40 points/action | Waste reduction and resource conservation |
| Tree Planting | 100 points/tree | Direct environmental impact |
| Energy Saving | 25 points/action | Reduced energy consumption |

##  Milestone System

Users progress through environmental milestones:
- **First Steps** (100 points) - Getting started with eco-friendly habits
- **Green Warrior** (500 points) - Committed to sustainable living
- **Eco Champion** (1,000 points) - Making significant environmental impact
- **Environmental Hero** (2,500 points) - Leading by example
- **Planet Saver** (5,000 points) - Maximum environmental contribution

##  API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Activity Tracking
- `POST /api/activity/activity` - Submit new activity
- `GET /api/activity/history` - Get activity history
- `GET /api/activity/stats` - Get activity statistics
- `GET /api/activity/rules` - Get points calculation rules

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/milestones` - Get milestone progress
- `GET /api/user/leaderboard` - Get leaderboard

### Weather (Bonus Feature)
- `GET /api/weather` - Get weather forecast
- `GET /api/temperature?city=<city>` - Get current temperature

##  Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Axios** - HTTP client for external APIs

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Development Tools
- **Webpack** - Module bundler
- **Babel** - JavaScript compiler
- **ESLint** - Code linting
- **PostCSS** - CSS processing

##  Documentation

Comprehensive documentation is available in the `documentation/` folder:

- **[Development Guide](documentation/DEVELOPMENT_GUIDE.md)** - Detailed developer documentation
- **[Component Documentation](documentation/COMPONENT_DOCUMENTATION.md)** - React components guide
- **[API Reference](documentation/API_REFERENCE.md)** - Complete API documentation
- **[API Documentation](documentation/API_DOCUMENTATION.md)** - Original API documentation

##  Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Error handling without sensitive data exposure

##  Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

##  Deployment

### Environment Variables for Production
```env
JWT_SECRET=your-production-secret-key
MONGODB_URI=your-production-mongodb-uri
PORT=3000
NODE_ENV=production
```

### Build for Production
```bash
npm run build
npm start
```

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the ISC License.

##  Support

If you encounter any issues or have questions:
1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

##  Future Enhancements

- [ ] Social features (friend connections, activity sharing)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Integration with fitness trackers
- [ ] Carbon footprint calculations
- [ ] Community challenges and events
- [ ] Reward redemption system
- [ ] Push notifications
- [ ] Offline support
- [ ] Multi-language support

---

