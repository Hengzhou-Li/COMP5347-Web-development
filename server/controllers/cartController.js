const Cart = require('../models/Cart');
const Phone = require('../models/Phone');
const User = require('../models/User');
const mongoose = require('mongoose');

// 获得购物车
exports.getUserCart = async (req, res) => {
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

    // 查找购物车（如不存在则创建）
    let cart = await Cart.findOne({ user: userId })
        .populate({
          path: 'items.phone',
          populate: { path: 'seller', select: 'firstname lastname' }
        });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // 清理无效商品（下架或无库存或 phone 不存在）
    const validItems = cart.items.filter(item =>
        item.phone && item.phone.isActive && item.phone.stock > 0
    );

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.json({
      ...cart.toObject(),
      totalAmount: validItems.reduce((sum, item) => sum + (item.priceSnapshot * item.quantity), 0)
    });

  } catch (err) {
    console.error('Cart fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

//添加到购物车
exports.addToCart = async (req, res) => {
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

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.phone.toString() === phoneId);
    if (existingItem) {
      existingItem.quantity += quantity;
      if (existingItem.quantity > phone.stock) {
        existingItem.quantity = phone.stock;
      }
    } else {
      cart.items.push({
        phone: phoneId,
        quantity,
        priceSnapshot: phone.price
      });
    }

    await cart.save();

    res.status(200).json({
      message: 'Item added to cart successfully',
      cartId: cart._id,
      itemCount: cart.items.length
    });

  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 从购物车里删除一个商品

exports.removeFromCart = async (req, res) => {
  const { userId, itemId } = req.params;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

//编辑购物车里一个商品的数量，不能超过stock
exports.updateCartItem = async (req, res) => {
  const { userId, itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const phone = await Phone.findById(item.phone);
    if (!phone) return res.status(404).json({ error: 'Product not found' });

    if (quantity > phone.stock) {
      return res.status(400).json({ error: 'Quantity exceeds stock' });
    }

    item.quantity = quantity;
    await cart.save();

    res.json({ message: 'Quantity updated', newQuantity: quantity });
  } catch (err) {
    console.error('Update cart item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
