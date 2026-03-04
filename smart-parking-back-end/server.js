const express = require('express');
const cors = require('cors');
require('./db');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve static files from 'public'

// routes
const userRoutes = require('./routes/user-routes');
app.use(userRoutes);
const parkingRoutes = require('./routes/parking-routes');
app.use(parkingRoutes);
const bookingRoutes = require('./routes/booking-routes');
app.use(bookingRoutes);
const aiRoutes = require('./routes/ai-routes');
app.use('/ai', aiRoutes);

app.listen(8000, () => console.log('App is Running'));
