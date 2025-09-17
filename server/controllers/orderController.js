const Order = require('../models/Order');
const Phone = require('../models/Phone');
const Cart = require('../models/Cart');

exports.createOrder = async (req, res) => {
    const { userId } = req.params;
    const { selectedItemIds } = req.body;

    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.phone');
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        const selectedItems = cart.items.filter(item =>
            selectedItemIds.includes(item._id.toString())
        );

        if (selectedItems.length === 0) {
            return res.status(400).json({ error: 'No items selected' });
        }

        const orderItems = [];

        for (const item of selectedItems) {
            const phone = await Phone.findById(item.phone._id);
            if (!phone || phone.stock < item.quantity) {
                return res.status(400).json({
                    error: `Product ${item.phone.title} has insufficient stock`
                });
            }

            // 减库存
            phone.stock -= item.quantity;
            await phone.save();

            orderItems.push({
                phone: item.phone._id,
                title: item.phone.title,
                price: item.priceSnapshot,
                quantity: item.quantity
            });
        }

        const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const order = new Order({
            user: userId,
            items: orderItems,
            totalAmount,
            status: 'Pending'
        });

        await order.save();

        // 从购物车中移除已下单的商品
        cart.items = cart.items.filter(item =>
            !selectedItemIds.includes(item._id.toString())
        );
        await cart.save();

        res.status(201).json({ message: 'Order created successfully', order });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

//获取用户订单
exports.getUserOrders = async (req, res) => {
    const { userId } = req.params;

    try {
        const orders = await Order.find({ user: userId}).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err){
        console.error('Error getting user orders for user', err);
        res.status(500).json({ error: 'Server error' });
    }
};

//用户取消订单
exports.cancelOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (order.status === 'Cancelled') {
            return res.status(400).json({ error: 'Order is already cancelled' });
        }
        if (order.status === 'Delivering') {
            return res.status(400).json({ error: 'Order is delivering, cannot cancel' });
        }

        if (order.status === 'Completed') {
            return res.status(400).json({ error: 'Order is Completed, cannot cancel' });
        }

        // 恢复库存
        for (const item of order.items) {
            const phone = await Phone.findById(item.phone);
            if (phone) {
                phone.stock += item.quantity;
                await phone.save();
            }
        }

        // 更新订单状态
        order.status = 'Cancelled';
        await order.save();

        res.json({ message: 'Order cancelled successfully', order });
    } catch (err) {
        console.error('Cancel order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};