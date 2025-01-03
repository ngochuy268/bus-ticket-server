const busModel = require('../models/busModel');

const busController = {
    getAllBuses: async (req, res) => {
        try {
            const buses = await busModel.getAllBuses();
            res.json(buses);
        } catch (err) {
            res.status(500).json({ error: 'Error getting data!' });
        }
    }
};

module.exports = busController;