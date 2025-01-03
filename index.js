const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'https://bus-ticket-client.vercel.app'], 
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'], 
    allowedHeaders: 'Content-Type, Authorization',
}));

// Routes
const busRoutes = require('./routes/busRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const emailRoutes = require('./routes/emailRoutes');

app.use('/api', busRoutes);
app.use('/api', bookingRoutes);
app.use('', emailRoutes);

// Start server
app.listen(5000, () => {
    console.log(`Server is running on port 5000`);
});