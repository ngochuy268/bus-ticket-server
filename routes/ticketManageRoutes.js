const express = require('express');
const { getTickets } = require('../controllers/ticketManageController');

const router = express.Router();

router.get('/tickets', getTickets);

module.exports = router;