const express = require('express');
const busController = require('../controllers/busController');

const router = express.Router();

router.get('/bus-route', busController.getAllBuses);
router.get('/bus-route/search', busController.getRoutesByDepartAndDest);
router.get('/route', busController.getAllRoutes);
module.exports = router;