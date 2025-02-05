const express = require('express');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.post('/booking', bookingController.createBooking);
router.get('/bookings', bookingController.getBookingsByPhone);
router.put('/bookings/:bookid', bookingController.updateBooking);
router.delete('/bookings/:bookid', bookingController.deleteBooking);

module.exports = router;