const express = require('express');
const busController = require('../controllers/busController');

const router = express.Router();

router.get('/bus-route', busController.getAllBuses);

module.exports = router;