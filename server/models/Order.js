const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    phone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Phone',
        required: true
    },
    title: String, // 冗余保存
    price: Number,
    quantity: Number
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Delivering', 'Cancelled', 'Completed'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);