const AdminLog = require('../models/AdminLog');

async function logAdminAction(adminEmail, action, targetType, target, details = '') {
    try {
        await AdminLog.create({
            adminEmail,
            action,
            targetType,
            target,
            details
        });
    } catch (err){
        console.error('failed to create admin log', err);
    }
}
module.exports = logAdminAction;