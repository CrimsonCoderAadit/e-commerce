const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    imageUrl: { type: String, default: '' },
    stock: { type: Number, required: true, default: 0, min: 0 },
    ratings: { type: [ratingSchema], default: [] },
    averageRating: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Text index for search
productSchema.index({ name: 'text', description: 'text' });

// Recalculate averageRating whenever ratings change
productSchema.methods.recalcRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((acc, r) => acc + r.value, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
  }
};

module.exports = mongoose.model('Product', productSchema);
