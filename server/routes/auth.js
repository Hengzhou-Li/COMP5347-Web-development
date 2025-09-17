const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);  //注册

router.post('/login', authController.login);   // 登录

router.get('/verify-email', authController.verifyEmail); // 邮箱验证

router.post('/password_reset_request', authController.password_reset_request);  //重设密码

router.post('/reset-password', authController.resetPassword);

router.post('/update_profile', authController.updateProfile);

router.post('/change_password', authController.changePassword);

module.exports = router;
