const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  phone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phone',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 99  // 防止异常数量
  },
  priceSnapshot: {  // 价格快照
    type: Number,
    required: true,
    min: 0
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});  // 禁用自动生成子文档ID

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  // 确保每个用户只有一个购物车
  },
  items: [wishlistItemSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: {  // 自动管理创建/更新时间
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

// 添加索引优化查询
//wishlistSchema.index({ user: 1 }); 重复索引警告
wishlistSchema.index({ 'items.phone': 1 });

// 添加虚拟字段计算总价
wishlistSchema.virtual('totalAmount').get(function() {
  return this.items.reduce((total, item) =>
    total + (item.priceSnapshot * item.quantity), 0);
});

// 添加验证中间件
wishlistSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Wishlist', wishlistSchema);