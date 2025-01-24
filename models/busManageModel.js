const connection = require('./db');

const BusModel = {
    // Lấy danh sách xe bus
    getAllBusesWithRoutes: async () => {
        try {
            const [rows] = await connection.promise().execute(`
                SELECT 
                    b.busid, 
                    b.busname, 
                    b.bustype, 
                    b.rate, 
                    b.cost, 
                    b.seat, 
                    b.description, 
                    b.image,
                    r.routeid,
                    r.depart,
                    r.dest,
                    r.departtime,
                    r.arrivaltime
                FROM bus b
                LEFT JOIN route r ON b.busid = r.busid
                ORDER BY b.busid, r.routeid
            `);
            return rows;
        } catch (error) {
            console.error('Error fetching buses with routes:', error);
            throw error;
        }
    },

    // Thêm xe bus mới
    addBus: async (busData) => {
        const { busname, bustype, rate, cost, seat, description, image } = busData;

        try {
            // Bước 1: Lấy giá trị busid lớn nhất hiện tại
            const [maxBusIdResult] = await connection.promise().execute(
                'SELECT busid FROM bus ORDER BY busid DESC LIMIT 1'
            );

            // Bước 2: Tách phần số từ busid lớn nhất
            let newBusNumber = 30; // Giá trị mặc định nếu không có bus nào trong DB
            if (maxBusIdResult.length > 0) {
                const maxBusId = maxBusIdResult[0].busid; // Ví dụ: "B29"
                const maxBusNumber = parseInt(maxBusId.replace('B', ''), 10); // Tách số từ "B29" -> 29
                newBusNumber = maxBusNumber + 1; // Tăng số lên 1
            }

            // Bước 3: Tạo busid mới
            const newBusId = `B${newBusNumber}`;

            // Bước 4: Thêm xe bus mới vào cơ sở dữ liệu
            const query = `
                INSERT INTO bus (busid, busname, bustype, rate, cost, seat, description, image)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [newBusId, busname, bustype, rate, cost, seat, description, image];
            await connection.promise().execute(query, values);

            // Bước 5: Lấy thông tin xe bus vừa thêm cùng với các route liên quan
            const [busWithRoutes] = await connection.promise().execute(`
                SELECT 
                    b.busid, 
                    b.busname, 
                    b.bustype, 
                    b.rate, 
                    b.cost, 
                    b.seat, 
                    b.description, 
                    b.image,
                    r.routeid,
                    r.depart,
                    r.dest,
                    r.departtime,
                    r.arrivaltime
                FROM bus b
                LEFT JOIN route r ON b.busid = r.busid
                WHERE b.busid = ?
                ORDER BY b.busid, r.routeid
            `, [newBusId]);

            // Bước 6: Nhóm các route theo busid
            const newBus = busWithRoutes.reduce((acc, row) => {
                if (!acc.busid) {
                    acc = {
                        busid: row.busid,
                        busname: row.busname,
                        bustype: row.bustype,
                        rate: row.rate,
                        cost: row.cost,
                        seat: row.seat,
                        description: row.description,
                        image: row.image,
                        routes: [],
                    };
                }
                if (row.routeid) {
                    acc.routes.push({
                        routeid: row.routeid,
                        depart: row.depart,
                        dest: row.dest,
                        departtime: row.departtime,
                        arrivaltime: row.arrivaltime,
                    });
                }
                return acc;
            }, {});

            return newBus; // Trả về thông tin xe bus cùng với các route
        } catch (error) {
            console.error('Error adding bus:', error);
            throw error;
        }
    },


    // Cập nhật thông tin xe bus và trả về cả thông tin route
    updateBus: async (busid, busData) => {
        const { busname, bustype, rate, cost, seat, description } = busData;

        try {
            // Cập nhật thông tin xe bus
            const query = `
                UPDATE bus
                SET busname = ?, bustype = ?, rate = ?, cost = ?, seat = ?, description = ?
                WHERE busid = ?
            `;
            const values = [busname, bustype, rate, cost, seat, description, busid];
            const [result] = await connection.promise().execute(query, values);

            if (result.affectedRows === 0) {
                throw new Error('Bus not found');
            }

            // Lấy lại thông tin xe bus cùng với các route liên quan
            const [busWithRoutes] = await connection.promise().execute(`
                SELECT 
                    b.busid, 
                    b.busname, 
                    b.bustype, 
                    b.rate, 
                    b.cost, 
                    b.seat, 
                    b.description, 
                    b.image,
                    r.routeid,
                    r.depart,
                    r.dest,
                    r.departtime,
                    r.arrivaltime
                FROM bus b
                LEFT JOIN route r ON b.busid = r.busid
                WHERE b.busid = ?
                ORDER BY b.busid, r.routeid
            `, [busid]);

            // Nhóm các route theo busid
            const updatedBus = busWithRoutes.reduce((acc, row) => {
                if (!acc.busid) {
                    acc = {
                        busid: row.busid,
                        busname: row.busname,
                        bustype: row.bustype,
                        rate: row.rate,
                        cost: row.cost,
                        seat: row.seat,
                        description: row.description,
                        image: row.image,
                        routes: [],
                    };
                }
                if (row.routeid) {
                    acc.routes.push({
                        routeid: row.routeid,
                        depart: row.depart,
                        dest: row.dest,
                        departtime: row.departtime,
                        arrivaltime: row.arrivaltime,
                    });
                }
                return acc;
            }, {});

            return updatedBus; // Trả về thông tin xe bus cùng với các route
        } catch (error) {
            console.error('Error updating bus:', error);
            throw error;
        }
    },

    deleteBusAndRoutes: async (busid) => {
        try {
            await connection.promise().execute('DELETE FROM route WHERE busid = ?', [busid]);
            await connection.promise().execute('DELETE FROM bus WHERE busid = ?', [busid]);
        } catch (error) {
            console.error('Error deleting bus and routes:', error);
            throw error;
        }
    },

     // Thêm route mới
    addRoute: async (routeData) => {
        const { busid, depart, dest, departtime, arrivaltime } = routeData;

        try {
            // Kiểm tra xem busid có tồn tại trong bảng bus hay không
            const [busExists] = await connection.promise().execute(
                'SELECT busid FROM bus WHERE busid = ?',
                [busid]
            );

            if (busExists.length === 0) {
                throw new Error('Bus ID does not exist');
            }

            // Lấy giá trị routeid lớn nhất hiện tại
            const [maxRouteIdResult] = await connection.promise().execute(
                'SELECT routeid FROM route ORDER BY routeid DESC LIMIT 1'
            );

            // Tạo routeid mới
            let newRouteNumber = 101; // Giá trị mặc định nếu không có route nào trong DB
            if (maxRouteIdResult.length > 0) {
                const maxRouteId = maxRouteIdResult[0].routeid; // Ví dụ: "R100"
                const maxRouteNumber = parseInt(maxRouteId.replace('R', ''), 10); // Tách số từ "R100" -> 100
                newRouteNumber = maxRouteNumber + 1; // Tăng số lên 1
            }
            const newRouteId = `R${newRouteNumber}`;

            // Thêm route mới vào cơ sở dữ liệu
            const query = `
                INSERT INTO route (routeid, busid, depart, dest, departtime, arrivaltime)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const values = [newRouteId, busid, depart, dest, departtime, arrivaltime];
            await connection.promise().execute(query, values);

            // Lấy dữ liệu route vừa thêm
            const [newRoute] = await connection.promise().execute(
                'SELECT * FROM route WHERE routeid = ?',
                [newRouteId]
            );

            return newRoute[0]; // Trả về thông tin route vừa thêm
        } catch (error) {
            console.error('Error adding route:', error);
            throw error;
        }
    },

    // Chỉnh sửa route
    updateRoute: async (routeId, routeData) => {
        const { depart, dest, departtime, arrivaltime } = routeData;

        try {
            const query = `
                UPDATE route
                SET depart = ?, dest = ?, departtime = ?, arrivaltime = ?
                WHERE routeid = ?
            `;
            const values = [depart, dest, departtime, arrivaltime, routeId];
            const [result] = await connection.promise().execute(query, values);

            if (result.affectedRows === 0) {
                throw new Error('Route not found');
            }

            // Lấy dữ liệu route đã cập nhật
            const [updatedRoute] = await connection.promise().execute(
                'SELECT * FROM route WHERE routeid = ?',
                [routeId]
            );

            return updatedRoute[0]; // Trả về dữ liệu route đã cập nhật
        } catch (error) {
            console.error('Error updating route:', error);
            throw error;
        }
    },

    // Xóa route
    deleteRoute: async (routeId) => {
        try {
            const query = 'DELETE FROM route WHERE routeid = ?';
            const [result] = await connection.promise().execute(query, [routeId]);

            if (result.affectedRows === 0) {
                throw new Error('Route not found');
            }

            return true; // Trả về true nếu xóa thành công
        } catch (error) {
            console.error('Error deleting route:', error);
            throw error;
        }
    },
};

module.exports = BusModel;