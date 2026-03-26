const Cart = require('../models/Cart');

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId }) || { userId: req.user.userId, items: [] };
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/cart/add
exports.addItem = async (req, res) => {
  try {
    const { productId, productName, price, quantity, imageUrl } = req.body;
    if (!productId || !productName || price == null || !quantity) {
      return res.status(422).json({ error: 'productId, productName, price, and quantity are required' });
    }

    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      cart = new Cart({ userId: req.user.userId, items: [] });
    }

    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ productId, productName, price, quantity, imageUrl: imageUrl || '' });
    }

    await cart.save();
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/cart/update
exports.updateItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity == null) {
      return res.status(422).json({ error: 'productId and quantity are required' });
    }

    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    if (quantity === 0) {
      cart.items = cart.items.filter((i) => i.productId !== productId);
    } else {
      const item = cart.items.find((i) => i.productId === productId);
      if (!item) return res.status(404).json({ error: 'Item not in cart' });
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/cart/remove
exports.removeItem = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(422).json({ error: 'productId is required' });

    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter((i) => i.productId !== productId);
    await cart.save();
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/cart/clear
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
