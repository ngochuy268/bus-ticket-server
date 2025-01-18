const busModel = require('../models/busModel');

const busController = {
    getAllBuses: async (req, res) => {
        try {
            const buses = await busModel.getAllBuses();
            res.json(buses);
        } catch (err) {
            res.status(500).json({ error: 'Error getting data!' });
        }
    },

    getAllRoutes: async (req, res) => {
        try {
            const routes = await busModel.getAllRoutes();
            res.json(routes);
        } catch (err) {
            res.status(500).json({ error: 'Error getting data!' });
        }
    },

    getRoutesByDepartAndDest: async (req, res) => {
        const { depart, dest } = req.query; 
        try {
            const routes = await busModel.getRoutesByDepartAndDest(depart, dest);
            res.json(routes);
        } catch (err) {
            res.status(500).json({ error: 'Error retrieving routes!' });
        }
    }
    
};

module.exports = busController;