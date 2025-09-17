const Wishlist = require('../models/Wishlist');
const Phone = require('../models/Phone');
const User = require('../models/User');
const mongoose = require('mongoose');

// 获得愿望单
exports.getUserWishlist = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // 验证用户是否存在且可用
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'User not available' });
    }

    // 查找愿望单（如不存在则创建）
    let wishlist = await Wishlist.findOne({ user: userId })
        .populate({
          path: 'items.phone',
          populate: { path: 'seller', select: 'firstname lastname' }
        });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    // 清理无效商品（下架或无库存或 phone 不存在）
    const validItems = wishlist.items.filter(item =>
        item.phone && item.phone.isActive && item.phone.stock > 0
    );

    if (validItems.length !== wishlist.items.length) {
      wishlist.items = validItems;
      await wishlist.save();
    }

    res.json({
      ...wishlist.toObject(),
      totalAmount: validItems.reduce((sum, item) => sum + (item.priceSnapshot * item.quantity), 0)
    });

  } catch (err) {
    console.error('Wishlist fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

//添加到愿望单
exports.addToWishlist = async (req, res) => {
  const { userId } = req.params;
  const { phoneId, quantity = 1 } = req.body;

  try {
    // 验证 ID 格式
    if (!mongoose.Types.ObjectId.isValid(phoneId)) {
      return res.status(400).json({ error: 'Invalid phone ID' });
    }

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'User not found or inactive' });
    }

    const phone = await Phone.findById(phoneId);
    if (!phone || !phone.isActive || phone.stock < 1) {
      return res.status(404).json({ error: 'Phone not available' });
    }

    if (quantity > phone.stock) {
      return res.status(400).json({ error: 'Insufficient stock', available: phone.stock });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    const existingItem = wishlist.items.find(item => item.phone.toString() === phoneId);
    if (existingItem) {
      existingItem.quantity += quantity;
      if (existingItem.quantity > phone.stock) {
        existingItem.quantity = phone.stock;
      }
    } else {
      wishlist.items.push({
        phone: phoneId,
        quantity,
        priceSnapshot: phone.price
      });
    }

    await wishlist.save();

    res.status(200).json({
      message: 'Item added to wishlist successfully',
      wishlistId: wishlist._id,
      itemCount: wishlist.items.length
    });

  } catch (err) {
    console.error('Add to wishlist error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 从愿望单里删除一个商品

exports.removeFromWishlist = async (req, res) => {
  const { userId, itemId } = req.params;

  try {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter(item => item.phone.toString() !== itemId);
    await wishlist.save();

    res.json({ message: 'Item removed from wishlist' });
  } catch (err) {
    console.error('Remove from wishlist error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

//编辑愿望单里一个商品的数量，不能超过stock
exports.updateWishlistItem = async (req, res) => {
  const { userId, itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  try {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) return res.status(404).json({ error: 'Wishlist not found' });

    const item = wishlist.items.id(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const phone = await Phone.findById(item.phone);
    if (!phone) return res.status(404).json({ error: 'Product not found' });

    if (quantity > phone.stock) {
      return res.status(400).json({ error: 'Quantity exceeds stock' });
    }

    item.quantity = quantity;
    await wishlist.save();

    res.json({ message: 'Quantity updated', newQuantity: quantity });
  } catch (err) {
    console.error('Update wishlist item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 检查某个商品是否已在愿望单中
exports.isInWishlist = async (req, res) => {
  const { userId, phoneId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(phoneId)) {
      return res.status(400).json({ error: 'Invalid user ID or phone ID' });
    }

    // 修复查询条件：检查 items 数组中的 phone 字段
    const isWishlisted = await Wishlist.exists({
      user: userId,
      'items.phone': phoneId
    });

    res.json({ isWishlisted: !!isWishlisted });
  } catch (err) {
    console.error('Check wishlist item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
