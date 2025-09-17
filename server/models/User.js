const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname:  { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, required: true },
    verified:  { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    isActive: {type: Boolean, default: true}, //user ban by admin
    lastLoginDate: { type: Date, default: null }
});

module.exports = mongoose.model('User', userSchema);