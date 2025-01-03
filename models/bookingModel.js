const connection = require('./db');

const bookingModel = {
    createBooking: async (bookingData) => {
        const { 
            name, phone, guests, departureDate, returnDate, departure, destination, selectedBus
        } = bookingData;

        const { busid, busname, rate, type, departtime, arrivaltime, cost, seat, image } = selectedBus;

        const dbConnection = await connection.promise().getConnection();

        try {
            await dbConnection.beginTransaction();

            const [busRows] = await dbConnection.query('SELECT seat FROM bus WHERE busid = ?', [busid]);
            if (busRows.length === 0) {
                throw new Error('Bus not found!');
            }

            const bus = busRows[0];
            if (bus.seat < guests) {
                throw new Error('Not enough seats available!');
            }

            await dbConnection.query(
                `INSERT INTO book 
                (departdate, returndate, bookdepart, bookdest, 
                bookimg, bookcost, bookbusname, bookbustype, bookrate, 
                bookguest, bookphone, bookname, bookdeparttime, bookarrivaltime, busid) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [departureDate, returnDate, departure, destination, 
                image, cost, busname, type, rate, guests, 
                phone, name, departtime, arrivaltime, busid]
            );

            const newSeatCount = bus.seat - guests;
            await dbConnection.query(
                `UPDATE bus SET seat = ? WHERE busid = ?`,
                [newSeatCount, busid]
            );

            await dbConnection.commit();
            return { message: 'Booking successful!' };
        } catch (error) {
            await dbConnection.rollback();
            throw error;
        } finally {
            dbConnection.release();
        }
    },

    getBookingsByPhone: async (phone) => {
        const sql = `
            SELECT *, 
            DATE_FORMAT(departdate, '%Y-%m-%d') AS departdate, 
            DATE_FORMAT(returndate, '%Y-%m-%d') AS returndate
            FROM book 
            WHERE bookphone = ?
        `;
        const [result] = await connection.promise().query(sql, [phone]);
        return result;
    },

    deleteBooking: async (bookid) => {
        const dbConnection = await connection.promise().getConnection();

        try {
            await dbConnection.beginTransaction();

            const [bookingRows] = await dbConnection.query('SELECT bookguest, busid FROM book WHERE bookid = ?', [bookid]);
            if (bookingRows.length === 0) {
                throw new Error('Booking not found!');
            }

            const { bookguest, busid } = bookingRows[0];

            await dbConnection.query('DELETE FROM book WHERE bookid = ?', [bookid]);

            await dbConnection.query(
                'UPDATE bus SET seat = seat + ? WHERE busid = ?',
                [bookguest, busid]
            );

            await dbConnection.commit();
            return { message: 'Booking deleted and seats updated successfully!' };
        } catch (error) {
            await dbConnection.rollback();
            throw error;
        } finally {
            dbConnection.release();
        }
    },
};

module.exports = bookingModel;