// routes/wishlist.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

//获取愿望单
router.get('/:userId', wishlistController.getUserWishlist)

//添加到愿望单
router.post('/:userId/add', wishlistController.addToWishlist);

//删除一个商品
router.delete('/:userId/item/:itemId', wishlistController.removeFromWishlist);

//编辑商品数量
router.put('/:userId/item/:itemId', wishlistController.updateWishlistItem)

//检查某个商品是否已在愿望单中
router.get('/:userId/contains/:phoneId', wishlistController.isInWishlist);

module.exports = router;