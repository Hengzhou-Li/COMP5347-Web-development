const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
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

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  // 确保每个用户只有一个购物车
  },
  items: [cartItemSchema],
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
//cartSchema.index({ user: 1 }); 重复索引警告
cartSchema.index({ 'items.phone': 1 });

// 添加虚拟字段计算总价
cartSchema.virtual('totalAmount').get(function() {
  return this.items.reduce((total, item) =>
    total + (item.priceSnapshot * item.quantity), 0);
});

// 添加验证中间件
cartSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// 库存校验
cartSchema.methods.validateStock = async function() {
  const phoneIds = this.items.map(item => item.phone);
  const phones = await mongoose.model('Phone').find({
    _id: { $in: phoneIds }
  });

  return this.items.every(item => {
    const phone = phones.find(p => p._id.equals(item.phone));
    return phone && phone.stock >= item.quantity;
  });
};

module.exports = mongoose.model('Cart', cartSchema);