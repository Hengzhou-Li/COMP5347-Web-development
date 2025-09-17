// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
app.use(cors({
    origin: 'http://localhost:3000', // 前端开发地址
    credentials: true
}));
app.use(express.json());

// 挂载路由
app.use('/api/auth', authRoutes);

// 连接数据库
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(5000, () => console.log('Server running at http://localhost:5000'));
    })
    .catch((err) => {
        console.error('MongoDB connection failed:', err);
    });

//admin 路由
app.use('/api/admin', require('./routes/admin'));

app.use('/api', require('./routes/phone'));
//profile用的是/api/phone，明天改前端

//cart 路由
const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);

//Order 路由
const orderRoutes = require('./routes/order');
app.use('/api/orders', orderRoutes);

//Wishlist 路由
const wishlistRoutes = require('./routes/wishlist');
app.use('/api/wishlist', wishlistRoutes);
// 测试