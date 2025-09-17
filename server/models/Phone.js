const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  _id: false,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  hidden: { type: String, required: false },
});

const phoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  brand: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  enabled: { type: Boolean, default: true },
  reviews: [{
    _id: false,
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    hidden: { type: String, required: false },
  }],
  isActive: {type: Boolean, default: true}, //phone ban by admin
});

module.exports = mongoose.model('Phone', phoneSchema);