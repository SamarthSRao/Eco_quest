require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const stravaRoutes  =  require('./routes/strava');
const gardenRoutes = require('./routes/garden');
const app = express();



// connect to mongodb
mongoose.connect('mongodb://localhost/ninja-go')
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Server will continue without MongoDB...');
  });
mongoose.Promise = global.Promise;

app.use(express.static('dist'));
app.use(bodyParser.json());


// Main API routes for ninjas
app.use('/api', require('./routes/api'));

// User Activity API routes (legacy)
const userActivityRoutes = require('./routes/userActivityApi');
app.use('/user-api', userActivityRoutes);

// New User-based Rewards API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/user', require('./routes/profile'));
app.use('/api/strava', stravaRoutes);

// Virtual garden endpoints (per-user persisted garden state)
app.use('/api',gardenRoutes);

// SPA fallback for client-side routes (must be after API routes)
app.get(/^(?!\/(api|user-api)\/).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


// -------------------------------------------------------------
// Route to fetch weather forecast data
// -------------------------------------------------------------
app.get('/api/weather', async (req, res, next) => {
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=2d23a3373cb04bc7848200854252108&q=Bengaluru&days=7`;

    try {
        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// -------------------------------------------------------------
// Route to fetch current temperature for any city
// -------------------------------------------------------------
app.get('/api/temperature', async (req, res, next) => {
    const city = req.query.city || 'Bengaluru';
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=2d23a3373cb04bc7848200854252108&q=${city}`;

    try {
        const response = await axios.get(apiUrl);
        const weatherData = response.data;
        
        // Extract relevant temperature data
        const temperatureData = {
            city: weatherData.location.name,
            country: weatherData.location.country,
            temperature: weatherData.current.temp_c,
            temperature_f: weatherData.current.temp_f,
            condition: weatherData.current.condition.text,
            humidity: weatherData.current.humidity,
            wind_speed: weatherData.current.wind_kph,
            last_updated: weatherData.current.last_updated
        };
        
        res.json(temperatureData);
    } catch (error) {
        console.error('Error fetching temperature data:', error);
        res.status(500).json({ error: 'Failed to fetch temperature data' });
    }
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// A simple GET route (can be removed if not needed)
app.get('/api', function(req, res) {
    console.log('GET request');
    res.send({ name: 'sam' });
});

app.listen(process.env.PORT || 3000, function() {
    console.log('================================');
    console.log('🚀 Server is running on port 3000');
    console.log('📡 API endpoints available:');
    console.log('   - GET /api/weather');
    console.log('   - GET /api/temperature?city=YourCity');
    console.log('   - GET /api');
    console.log('');
    console.log('🔐 Authentication endpoints:');
    console.log('   - POST /api/auth/register');
    console.log('   - POST /api/auth/login');
    console.log('');
    console.log('📊 Activity & Rewards endpoints:');
    console.log('   - POST /api/activity/activity');
    console.log('   - GET /api/activity/history');
    console.log('   - GET /api/activity/stats');
    console.log('   - GET /api/activity/rules');
    console.log('');
    console.log('👤 User Profile endpoints:');
    console.log('   - GET /api/user/profile');
    console.log('   - GET /api/user/activitylog');
    console.log('   - GET /api/user/milestones');
    console.log('   - GET /api/user/leaderboard');
    console.log('');
    console.log('🌱 Virtual Garden endpoints:');
    console.log('   - GET /api/garden');
    console.log('   - POST /api/garden/plant');
    console.log('   - POST /api/garden/water');
    console.log('   - POST /api/garden/harvest');
    console.log('   - POST /api/garden/weather');
    console.log('================================');
});