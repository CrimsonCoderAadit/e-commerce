const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId:   { type: String, required: true },
    productName: { type: String, required: true },
    price:       { type: Number, required: true, min: 0 },
    quantity:    { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId:      { type: String, required: true },
    items:       { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      street:  { type: String, default: '' },
      city:    { type: String, default: '' },
      state:   { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
