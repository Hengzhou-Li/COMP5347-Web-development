const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 创建订单
router.post('/:userId', orderController.createOrder);

// fetch 订单
router.get('/user/:userId', orderController.getUserOrders);

// 取消订单
router.put('/:orderId/cancel', orderController.cancelOrder);


module.exports = router;