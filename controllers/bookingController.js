const bookingModel = require('../models/bookingModel');

const bookingController = {
    createBooking: async (req, res) => {
        const bookingData = req.body;

        if (!bookingData.departureDate || !bookingData.returnDate || !bookingData.departure || !bookingData.destination || !bookingData.guests || !bookingData.name || !bookingData.phone) {
            return res.status(400).json({ message: 'All fields are required!' });
        }

        try {
            await bookingModel.createBooking(bookingData);
            res.status(200).json({ message: 'Booking successful!' });
        } catch (error) {
            console.error('Error during booking transaction:', error);
            res.status(500).json({ message: 'Internal server error!' });
        }
    },

    getBookingsByPhone: async (req, res) => {
        const { phone, email } = req.query;
        try {
            const bookings = await bookingModel.getBookingsByPhone(phone, email);
            if (bookings.length === 0) {
                res.status(404).json({ message: 'No bookings found for this phone number!' });
            } else {
                res.status(200).json(bookings);
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
            res.status(500).json({ message: 'Internal server error!' });
        }
    },

    deleteBooking: async (req, res) => {
        const { bookid } = req.params;

        try {
            await bookingModel.deleteBooking(bookid);
            res.status(200).json({ message: 'Booking deleted successfully!' });
        } catch (err) {
            console.error('Error deleting booking:', err);
            res.status(500).json({ message: 'Internal server error!' });
        }
    }
};

module.exports = bookingController;