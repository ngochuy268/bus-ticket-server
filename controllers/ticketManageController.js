const { getAllTickets, groupTicketsWithNames  } = require('../models/ticketManageModel');

const getTickets = async (req, res) => {
    try {
        const tickets = await getAllTickets();
        const groupedTickets = groupTicketsWithNames(tickets);
        res.status(200).json(groupedTickets);
    } catch (error) {
        console.error('Error in getTickets controller:', error);
        res.status(500).json({ message: 'Failed to fetch tickets' });
    }
};

module.exports = {
    getTickets,
};