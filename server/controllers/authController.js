// server/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// 注册功能
exports.register = async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        // 字段不能为空
        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ msg: 'All fields are required.' });
        }

        // 邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: 'Invalid email address.' });
        }

        // 密码长度校验
        if (password.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters.' });
        }

        // 检查邮箱是否已经注册
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'Email already exists.' });
        }

        // 哈希加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建用户
        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword
        });

        await newUser.save();


        // 发送邮件
        const emailToken = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const url = `${process.env.CLIENT_URL}/verify-email?token=${emailToken}`;
        const html = `
          <h3>Email Verification</h3>
          <p>Click the link below to verify your email address:</p>
          <a href="${url}">${url}</a>
        `;

        // 返回成功消息
        res.status(201).json({ msg: 'Account created successfully. Please verify your email.' });


        await sendEmail(email, 'Verify your OldPhoneDeals account', html);

    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ msg: 'Server error.' });
    }
};


// 登录
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 基本校验
        if (!email || !password) {
            return res.status(400).json({ msg: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials.' });

        if (!user.verified) {
            return res.status(403).json({ msg: 'Please verify your email before logging in.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials.' });

        // 维护lastlogin 时间
        user.lastLoginDate = new Date();
        await user.save();

        // 创建 JWT
        const token = jwt.sign({
            id: user._id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname
        }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            msg: 'Login successful',
            token,
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};


// 邮箱验证 发邮件
exports.verifyEmail = async (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ msg: 'Verification token is missing.' });
    }

    try {
        // 解码 token，获取用户 ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(400).json({ msg: 'User not found.' });
        }

        if (user.verified) {
            return res.status(200).json({ msg: 'Email already verified.' });
        }

        user.verified = true;
        await user.save();

        res.status(200).json({ msg: 'Email successfully verified.' });

    } catch (err) {
        console.error('Email verification error:', err);
        res.status(400).json({ msg: 'Invalid or expired token.' });
    }
};

// 重设密码发邮件
exports.password_reset_request = async (req, res) => {
    const { email } = req.body;

    try {
        // 查找用户
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'Email not found.' });
        }

        // 生成JWT token
        const resetToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // 构造重设链接
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        const html = `
          <h3>Reset Your Password</h3>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link will expire in 15 minutes.</p>
        `;

        await sendEmail(user.email, 'Reset your password - OldPhoneDeals', html);
        res.status(200).json({ msg: 'Password reset email sent.' });

    } catch (err) {
        console.error('Forgot Password error:', err);
        res.status(500).json({ msg: 'Server error.' });
    }
};

// 在给的重设密码界面里重设密码
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // 1. 验证 token 有效性
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 2. 查找用户
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ msg: 'User not found.' });

        // 3. 更新加密后的新密码
        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;

        await user.save();

        res.status(200).json({ msg: 'Password updated successfully.' });

    } catch (err) {
        console.error('Reset password error:', err);
        res.status(400).json({ msg: 'Invalid or expired token.' });
    }
};

// 更新当前用户资料
exports.updateProfile = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    try {
        // 手动从 Authorization header 获取 token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ msg: 'No token provided.' });
        }

        const token = authHeader.split(' ')[1];

        // 解码 token 获取用户 ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ msg: 'User not found.' });

        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ msg: 'Incorrect password.' });

        // 更新字段
        user.firstname = firstname || user.firstname;
        user.lastname = lastname || user.lastname;
        user.email = email || user.email;

        await user.save();

        res.json({
            id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ msg: 'Server error.' });
    }
};

// 修改密码并发送确认邮件
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        // 从请求头中获取用户身份
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ msg: 'No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ msg: 'User not found.' });

        // 验证当前密码
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ msg: 'Incorrect current password.' });

        // 更新密码
        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();

        // 发送确认邮件
        const html = `
          <h3>Password Changed</h3>
          <p>Your password has been changed successfully.</p>
        `;
        await sendEmail(user.email, 'Password Changed Successfully', html);

        res.status(200).json({ msg: 'Password changed successfully.' });

    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ msg: 'Server error.' });
    }
};