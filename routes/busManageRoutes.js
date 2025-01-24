const express = require('express');
const busController = require('../controllers/busManageController');
const router = express.Router();


router.get('/buses-with-routes', busController.getBusesWithRoutes);
// Cập nhật thông tin xe bus
router.put('/buses/:busid', busController.updateBus);
// Thêm bus
router.post('/buses', busController.addBus);
// Xóa bus
router.delete('/buses/:busid', busController.deleteBus);
// Thêm route mới
router.post('/routes', busController.addRoute);

// Chỉnh sửa route
router.put('/routes/:routeid', busController.updateRoute);

// Xóa route
router.delete('/routes/:routeid', busController.deleteRoute);

module.exports = router;