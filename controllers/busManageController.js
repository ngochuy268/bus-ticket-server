const BusModel = require('../models/busManageModel');

const BusController = {
    getBusesWithRoutes: async (req, res) => {
        try {
            const data = await BusModel.getAllBusesWithRoutes();

            // Nhóm các route theo busid
            const busesWithRoutes = data.reduce((acc, row) => {
                const bus = acc.find(b => b.busid === row.busid);
                if (bus) {
                    bus.routes.push({
                        routeid: row.routeid,
                        depart: row.depart,
                        dest: row.dest,
                        departtime: row.departtime,
                        arrivaltime: row.arrivaltime,
                    });
                } else {
                    acc.push({
                        busid: row.busid,
                        busname: row.busname,
                        bustype: row.bustype,
                        rate: row.rate,
                        cost: row.cost,
                        seat: row.seat,
                        description: row.description,
                        image: row.image,
                        routes: [{
                            routeid: row.routeid,
                            depart: row.depart,
                            dest: row.dest,
                            departtime: row.departtime,
                            arrivaltime: row.arrivaltime,
                        }],
                    });
                }
                return acc;
            }, []);

            res.status(200).json(busesWithRoutes);
        } catch (error) {
            console.error('Error fetching buses with routes:', error);
            res.status(500).json({ message: 'Failed to fetch buses with routes.' });
        }
    },

    // Thêm xe bus mới
    addBus: async (req, res) => {
        try {
            const { busname, bustype, rate, cost, seat, description, image } = req.body;

            // Lưu ảnh dưới dạng base64 vào cơ sở dữ liệu
            const newBus = await BusModel.addBus({ busname, bustype, rate, cost, seat, description, image });

            res.status(201).json({ message: 'Bus added successfully', bus: newBus });
        } catch (error) {
            console.error('Error adding bus:', error);
            res.status(500).json({ message: 'Failed to add bus' });
        }
    },

    // Cập nhật thông tin xe bus
    updateBus: async (req, res) => {
        try {
            const { busid } = req.params;
            const busData = req.body;

            // Gọi model để cập nhật thông tin xe bus và lấy lại thông tin route
            const updatedBus = await BusModel.updateBus(busid, busData);

            res.status(200).json({ message: 'Bus updated successfully', bus: updatedBus });
        } catch (error) {
            console.error('Error updating bus:', error);
            if (error.message === 'Bus not found') {
                res.status(404).json({ message: 'Bus not found' });
            } else {
                res.status(500).json({ message: 'Failed to update bus' });
            }
        }
    },

    deleteBus: async (req, res) => {
        const { busid } = req.params;

        try {
            await BusModel.deleteBusAndRoutes(busid);
            res.status(200).json({ message: 'Bus and its routes deleted successfully.' });
        } catch (error) {
            console.error('Error deleting bus:', error);
            res.status(500).json({ message: 'Failed to delete bus.' });
        }
    },

    // Thêm route mới
    addRoute: async (req, res) => {
        try {
            const { busid, depart, dest, departtime, arrivaltime } = req.body;

            // Gọi model để thêm route và lấy dữ liệu route đã thêm
            const newRoute = await BusModel.addRoute({ busid, depart, dest, departtime, arrivaltime });

            res.status(201).json({ message: 'Route added successfully', route: newRoute });
        } catch (error) {
            console.error('Error adding route:', error);
            if (error.message === 'Bus ID does not exist') {
                res.status(400).json({ message: 'Bus ID does not exist' });
            } else {
                res.status(500).json({ message: 'Failed to add route' });
            }
        }
    },

    // Chỉnh sửa route
    updateRoute: async (req, res) => {
        try {
            const { routeid } = req.params;
            const { depart, dest, departtime, arrivaltime } = req.body;

            // Gọi model để cập nhật route và lấy dữ liệu route đã cập nhật
            const updatedRoute = await BusModel.updateRoute(routeid, { depart, dest, departtime, arrivaltime });

            if (updatedRoute) {
                res.status(200).json({ message: 'Route updated successfully', route: updatedRoute });
            } else {
                res.status(404).json({ message: 'Route not found' });
            }
        } catch (error) {
            console.error('Error updating route:', error);
            res.status(500).json({ message: 'Failed to update route' });
        }
    },

    // Xóa route
    deleteRoute: async (req, res) => {
        try {
            const { routeid } = req.params;

            const isDeleted = await BusModel.deleteRoute(routeid);
            if (isDeleted) {
                res.status(200).json({ message: 'Route deleted successfully' });
            } else {
                res.status(404).json({ message: 'Route not found' });
            }
        } catch (error) {
            console.error('Error deleting route:', error);
            res.status(500).json({ message: 'Failed to delete route' });
        }
    },
};

module.exports = BusController;