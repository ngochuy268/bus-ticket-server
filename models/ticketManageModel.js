const db = require('./db'); 

// Lấy danh sách tất cả các vé và thông tin người đăng ký
const getAllTickets = async () => {
    try {
        const query = `
            SELECT 
                b.bookid, 
                b.departdate, 
                b.returndate, 
                b.bookdepart, 
                b.bookdest, 
                b.bookimg, 
                b.bookbusname, 
                b.bookbustype, 
                b.bookrate, 
                b.bookguest, 
                b.bookdeparttime, 
                b.bookarrivaltime,
                bn.name,
                bn.phone,
                bn.email,
                bn.gender
            FROM 
                book b
            LEFT JOIN 
                book_names bn ON b.bookid = bn.bookid
            ORDER BY 
                b.bookid;
        `;
        const [rows] = await db.promise().execute(query);
        return rows;
    } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
    }
};

const groupTicketsWithNames = (tickets) => {
    const groupedData = {};

    tickets.forEach((row) => {
        if (!groupedData[row.bookid]) {
            groupedData[row.bookid] = {
                bookid: row.bookid,
                departdate: row.departdate,
                returndate: row.returndate,
                bookdepart: row.bookdepart,
                bookdest: row.bookdest,
                bookimg: row.bookimg,
                bookbusname: row.bookbusname,
                bookbustype: row.bookbustype,
                bookrate: row.bookrate,
                bookguest: row.bookguest,
                bookdeparttime: row.bookdeparttime,
                bookarrivaltime: row.bookarrivaltime,
                names: [], 
            };
        }

        if (row.name) {
            groupedData[row.bookid].names.push({
                name: row.name,
                phone: row.phone,
                email: row.email,
                gender: row.gender,
            });
        }
    });

    // Chuyển đổi groupedData thành mảng
    return Object.values(groupedData);
};

module.exports = {
    getAllTickets,
    groupTicketsWithNames
};