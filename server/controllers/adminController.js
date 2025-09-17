const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Phone = require('../models/Phone');
const logAdminAction = require('../utils/logAction');
const mongoose = require('mongoose');


// admin login
exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {

        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
        if (!match) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '30m' }
        );

        res.status(200).json({ msg: 'Admin login successful', token });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ msg: 'Server error' });
    }

};



// get users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // 不返回密码
        res.status(200).json(users);
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ msg: 'Failed to get users.' });
    }
};

// edit users
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, email } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { firstname, lastname, email },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        await logAdminAction(process.env.ADMIN_EMAIL, 'EDIT_USER','USER' ,id, 'change email and name');
        res.status(200).json({ msg: 'User updated successfully.', user: updatedUser });
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ msg: 'Failed to update user.' });
    }
};


//user ban by admin
exports.toggleUserActive = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.isActive = !user.isActive;
        await user.save();

        await logAdminAction(process.env.ADMIN_EMAIL, 'DISABLE/ENABLE_USER','USER' ,id, 'disable or enable user');
        res.status(200).json({ msg: 'User updated', user });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

// delete users
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ msg: 'User not found.' });

        await logAdminAction(process.env.ADMIN_EMAIL, 'DELETE_USER','USER' ,id, 'delete user');
        res.status(200).json({ msg: 'User deleted successfully.' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ msg: 'Server error.' });
    }
};


// 获得所有phone listing
exports.getAllListings = async (req, res) => {
    try {
        const listings = await Phone.find()
            .populate('seller', 'firstname lastname email')
            .sort({ createdAt: -1 });
        res.json(listings);
    } catch (err) {
        console.error('Error fetching listings:', err);
        res.status(500).json({ error: 'Failed to fetch listings' });
    }
};

// 对listing phone 编辑
exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const { title, price, stock } = req.body;

    try {
        const phone = await Phone.findByIdAndUpdate(
            id,
            { title, price, stock },
            { new: true}
        );
        if (!phone) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        await logAdminAction(process.env.ADMIN_EMAIL, 'EDIT_PHONE_LISTING','LISTING' ,id, 'edit listing phone');
        res.status(200).json({ msg: 'Listing updated successfully.', listing: phone });
    } catch (err) {
        console.error('Failed to update listing:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};


// enable disable listing phone
exports.toggleListingActive = async (req, res) => {
    const { id } = req.params;

    try {
        const phone = await Phone.findById(id);
        if (!phone) return res.status(404).json({ msg: 'Listing not found' });

        phone.isActive = !phone.isActive;
        await phone.save();

        await logAdminAction(process.env.ADMIN_EMAIL, 'ENABLE/DISABLE_PHONE_LISTING','LISTING' ,id, 'enable or disable listing phone');
        res.json({ msg: 'Listing status updated', listing: phone });
    } catch (err) {
        console.error('Failed to toggle status:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};


//删除 listing phone
exports.deleteListing = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await Phone.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ msg: 'Listing not found' });

        await logAdminAction(process.env.ADMIN_EMAIL, 'DELETE_PHONE_LISTING','LISTING' ,id, 'delete listing phone');
        res.json({ msg: 'Listing deleted' });

    } catch (err) {
        console.error('Failed to delete listing:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// 获取所有评论，包括隐藏的
exports.getAllReviews = async (req, res) => {
  try {
    const phones = await Phone.find({})
      .populate('seller', 'firstname lastname')
      .populate('reviews.reviewer', 'firstname lastname');

    const allReviews = [];

    phones.forEach(phone => {
      phone.reviews.forEach(review => {
        allReviews.push({
          _id: review._id,
          content: review.comment,
          rating: review.rating,
          hidden: review.hidden,
          user: review.reviewer,
          listing: { title: phone.title, _id: phone._id },
        });
      });
    });

    res.json(allReviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// 切换评论可见性
exports.toggleReviewVisibility = async (req, res) => {
  const { listingId, reviewId } = req.params;  // 用两个参数定位评论

  try {
    const phone = await Phone.findById(listingId);
    if (!phone) return res.status(404).json({ message: 'Listing not found' });

    const review = phone.reviews.find(r => r.reviewer.toString() === reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // 切换 hidden 字符串状态
    if (review.hidden === "true") {
      review.hidden = "false";
    } else {
      review.hidden = "true";
    }

    await phone.save();

    res.status(200).json({
      message: 'Review visibility toggled successfully',
      hidden: review.hidden,
    });
  } catch (error) {
    console.error('Error toggling review visibility:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const AdminLog = require('../models/AdminLog');

exports.getAdminLogs = async (req, res) => {
    try {
        const logs = await AdminLog.find().sort({ timestamp: -1 }).limit(500);
        res.json(logs);
    } catch (err) {
        console.error('Error fetching admin logs:', err);
        res.status(500).json({ msg: 'Failed to load admin logs' });
    }
};


const Order = require('../models/Order');
//admin 获取所有订单信息
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'firstname lastname email')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) {
        console.error('Failed to fetch orders:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

const sendEmail = require('../utils/sendEmail');
exports.updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId).populate('user');
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (order.status !== 'Pending') {
            return res.status(400).json({ error: 'Only pending orders can be updated' });
        }

        // 切换为 Delivering
        order.status = 'Delivering';
        await order.save();
        await logAdminAction(process.env.ADMIN_EMAIL, 'DELIVER_ORDER','ORDER' ,orderId, 'Admin deliver order');

        // 发送邮件通知user
        if (order.user && order.user.email) {
            await sendEmail(
                order.user.email,
                'Your order is on the way!',
                `<p>Hi ${order.user.firstname || 'Customer'}, your order <strong>${order._id}</strong> is now on the way.</p>`
            );
        }

        // 30s 后切换完成，模拟订单送达
        setTimeout(async () => {
            const current = await Order.findById(orderId).populate('user');
            if (current && current.status === 'Delivering') {
                current.status = 'Completed';
                await current.save();

                await sendEmail(
                    current.user.email,
                    'Your order has been delivered!',
                    `<p>Hi ${current.user.firstname || 'Customer'}, your order <strong>${current._id}</strong> has been delivered. Thank you!</p>`
                );
            }
        }, 30000);

        res.json({ message: 'Order status updated to Delivering', order });

    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
