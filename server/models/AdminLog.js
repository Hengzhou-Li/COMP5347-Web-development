const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
    adminEmail: {type: String, required: true},
    action: {type: String, required: true},
    targetType:{type: String, required: true},
    target: {type: String, required: true},
    timestamp: {type: Date, default: Date.now},
    details: {type: String}
})

module.exports = mongoose.model('AdminLog', adminLogSchema);