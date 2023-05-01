const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  expirydate: {
    type: String,
    required: true,
  },
  minPurchase: {
    type: Number,
    required:true,
  },
  maxDiscount: {
    type: Number,
    required:true,
  },
  createdDate: {
    type: Date,
    required:true,
  },
  isActive:{
    type:Boolean,
    default:'true'
  },
  usedBy: {
    type: Array,
    required: true
  }
});

module.exports = mongoose.model('Coupon', couponSchema);