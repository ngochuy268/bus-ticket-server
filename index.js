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
const otpRoutes = require('./routes/otpRoutes');
const signupRoutes = require('./routes/signUpRoutes');
const forgotRoutes = require('./routes/forgotPWRoutes')
const resetRoutes = require('./routes/resetPWRoutes');
const loginRoutes = require('./routes/loginRoutes');
const busList = require('./routes/busManageRoutes');
const ticket = require('./routes/ticketManageRoutes')

app.use('/api', busRoutes);
app.use('/api', bookingRoutes);
app.use('', emailRoutes);
app.use('/api', otpRoutes);
app.use('/api', signupRoutes);
app.use('/api', forgotRoutes);
app.use('/api', resetRoutes);
app.use('/api', loginRoutes);
app.use('/api', busList);
app.use('/api', ticket);

// Start server
app.listen(5000, () => {
    console.log(`Server is running on port 5000`);
});