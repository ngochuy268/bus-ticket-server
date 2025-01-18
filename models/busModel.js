const connection = require('./db');

const busModel = {
    getAllBuses: async () => {
        const sql = `
            SELECT *
            FROM bus
        `;
        const [result] = await connection.promise().query(sql);
        return result;
    },

    getAllRoutes: async () => {
        const sql = `
            SELECT depart, dest
            FROM route
        `;
        const [result] = await connection.promise().query(sql);
        return result;
    },

    getRoutesByDepartAndDest: async (depart, dest) => {
        const sql = `
            SELECT r.*, b.*
            FROM route r
            JOIN bus b ON r.busid = b.busid
            WHERE r.depart = ? AND r.dest = ?
        `;
        const [result] = await connection.promise().query(sql, [depart, dest]);
        return result;
    }
};

module.exports = busModel;