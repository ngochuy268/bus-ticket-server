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
            name, phone, email, guests, gender, departureDate, returnDate, departure, destination, selectedBus, confirmCode, receiveCode
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

            const [bookResult] = await dbConnection.query(
                `INSERT INTO book 
                (departdate, returndate, bookdepart, bookdest, 
                bookimg, bookcost, bookbusname, bookbustype, bookrate, 
                bookguest, bookdeparttime, bookarrivaltime, busid, code) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [departureDate, returnDate, departure, destination, 
                image, cost, busname, type, rate, guests,
                departtime, arrivaltime, busid, confirmCode]
            );

            const bookid = bookResult.insertId;
            if (name && name.length > 0) {
                const guestInserts = name.map((n, index) => [
                    bookid, 
                    n, 
                    phone[index] || '', 
                    email[index] || '',
                    gender[index] || '', 
                    receiveCode[index] || 0 
                ]);
    
                await dbConnection.query(
                    `INSERT INTO book_names 
                    (bookid, name, phone, email, gender, receivecode) 
                    VALUES ?`,
                    [guestInserts]
                );
            }

            const newSeatCount = bus.seat - guests;
            await dbConnection.query(
                `UPDATE bus SET seat = ? WHERE busid = ?`,
                [newSeatCount, busid]
            );

            await dbConnection.commit();
            for (let i = 0; i < email.length; i++) {
                const recipientEmail = email[i];
                const recipientReceiveCode = receiveCode[i];
            
                    let htmlContent = `
                    <h2>ご予約ありがとうございます！</h2>
                `;

                if (recipientReceiveCode === 1) {
                    htmlContent += `
                        <p>あなたの予約IDは: <strong>${confirmCode}</strong></p>
                        <p>今後の参照用にこの ID を保管しておいてください。</p>
                    `;
                }

                htmlContent += `
                    <p>詳細:</p>
                    <ul>
                        <li>出発: ${departure}</li>
                        <li>行き先: ${destination}</li>
                        <li>出発日: ${departureDate}</li>
                        ${returnDate ? `<li>帰国日: ${returnDate}</li>` : ''}
                        <li>バス: ${busname} (${type})</li>
                        <li>料金: ${cost}￥</li>
                        <li>ゲスト: ${guests}</li>
                        <li>名前: <ul>${name.map(n => `<li>${n}</li>`).join('')}</ul></li>
                    </ul>
                `;
            
                const mailOptions = {
                    from: '"Woox Booking" <popvibes.net@gmail.com>',
                    to: recipientEmail,
                    subject: '予約確認書',
                    html: htmlContent,
                };
            
                await transporter.sendMail(mailOptions);
            }

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
            SELECT 
                b.*, 
                GROUP_CONCAT(bn.name SEPARATOR ', ') AS names, 
                GROUP_CONCAT(bn.phone SEPARATOR ', ') AS phones, 
                GROUP_CONCAT(bn.email SEPARATOR ', ') AS emails, 
                GROUP_CONCAT(bn.gender SEPARATOR ', ') AS genders, 
                DATE_FORMAT(b.departdate, '%Y-%m-%d') AS departdate, 
                DATE_FORMAT(b.returndate, '%Y-%m-%d') AS returndate
            FROM book b
            LEFT JOIN book_names bn ON b.bookid = bn.bookid
            WHERE b.code = ? 
            AND b.bookid IN (
                SELECT bookid FROM book_names WHERE phone = ?
            )
            GROUP BY b.bookid;
        `;
        const [result] = await connection.promise().query(sql, [email, phone]);
        return result;
    },

    deleteBooking: async (bookid, phone) => {
        const dbConnection = await connection.promise().getConnection();

        try {
            await dbConnection.beginTransaction();

            const [bookingRows] = await dbConnection.query('SELECT bookguest, busid FROM book WHERE bookid = ?', [bookid]);
            if (bookingRows.length === 0) {
                throw new Error('Booking not found!');
            }

            const [guestRows] = await dbConnection.query(
                'SELECT phone FROM book_names WHERE bookid = ? AND receivecode = 1',
                [bookid]
            );
            if (guestRows.length === 0) {
                throw new Error('No guest with receiveCode = 1 found!');
            }

            const guestPhone = guestRows[0].phone;
            if (guestPhone !== phone) {
                throw new Error('Phone does not match the guest with receiveCode = 1!');
            }

            const { bookguest, busid } = bookingRows[0];
            
            await dbConnection.query('DELETE FROM book_names WHERE bookid = ?', [bookid]);

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