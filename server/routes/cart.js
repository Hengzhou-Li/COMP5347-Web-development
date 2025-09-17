// routes/cart.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

//
//获取购物车
router.get('/:userId', cartController.getUserCart)

//添加到购物车
router.post('/:userId/add', cartController.addToCart);

//删除一个商品
router.delete('/:userId/item/:itemId', cartController.removeFromCart);

//编辑商品数量
router.put('/:userId/item/:itemId', cartController.updateCartItem)

module.exports = router;