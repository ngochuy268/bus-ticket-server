const connection = require('./db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'popvibes.net@gmail.com',
        pass: 'gejl hpdl ergo qsdx',
    },
});

const bookingModel = {
    createBooking: async (bookingData) => {
        const { 
            name, phone, email, guests, departureDate, returnDate, departure, destination, selectedBus, confirmCode
        } = bookingData;

        const { busid, busname, rate, type, departtime, arrivaltime, cost, image } = selectedBus;

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
                bookguest, bookphone, bookname, bookemail, bookdeparttime, bookarrivaltime, busid, code) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [departureDate, returnDate, departure, destination, 
                image, cost, busname, type, rate, guests, 
                phone, name, email, departtime, arrivaltime, busid, confirmCode]
            );

            const newSeatCount = bus.seat - guests;
            await dbConnection.query(
                `UPDATE bus SET seat = ? WHERE busid = ?`,
                [newSeatCount, busid]
            );

            await dbConnection.commit();

            const mailOptions = {
                from: '"PopVibes Booking" <popvibes.net@gmail.com>',
                to: email,
                subject: '予約確認書',
                html: `
                    <h2>ご予約ありがとうございます！</h2>
                    <p>あなたの予約IDは: <strong>${confirmCode}</strong></p>
                    <p>今後の参照用にこの ID を保管しておいてください。</p>
                    <p>詳細:</p>
                    <ul>
                        <li>出発: ${departure} (${departureDate})</li>
                        <li>行き先: ${destination} (${returnDate})</li>
                        <li>バス: ${busname} (${type})</li>
                        <li>料金: ${cost}￥</li>
                        <li>ゲスト: ${guests}</li>
                    </ul>
                `,
            };

            await transporter.sendMail(mailOptions);

        return { message: 'Booking successful and email sent!' };

        } catch (error) {
            await dbConnection.rollback();
            throw error;
        } finally {
            dbConnection.release();
        }
    },

    getBookingsByPhone: async (phone, email) => {
        const sql = `
            SELECT *, 
            DATE_FORMAT(departdate, '%Y-%m-%d') AS departdate, 
            DATE_FORMAT(returndate, '%Y-%m-%d') AS returndate
            FROM book 
            WHERE bookphone = ? AND code = ?
        `;
        const [result] = await connection.promise().query(sql, [phone, email]);
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