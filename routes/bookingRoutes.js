const express = require('express');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.post('/booking', bookingController.createBooking);
router.get('/bookings/:phone', bookingController.getBookingsByPhone);
router.delete('/bookings/:bookid', bookingController.deleteBooking);

module.exports = router;