const connection = require('./db');

const busModel = {
    getAllBuses: async () => {
        const sql = `
            SELECT *
            FROM bus
            INNER JOIN route ON bus.busid = route.busid
        `;
        const [result] = await connection.promise().query(sql);
        return result;
    }
};

module.exports = busModel;