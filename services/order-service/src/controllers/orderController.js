const Cart = require('../models/Cart');
const Order = require('../models/Order');
const { publishEvent } = require('../rabbitmq');

// POST /api/orders/checkout
exports.checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const items = cart.items.map(({ productId, productName, price, quantity }) => ({
      productId, productName, price, quantity,
    }));
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingAddress = req.body.shippingAddress || {};

    const order = await Order.create({
      userId: req.user.userId,
      items,
      totalAmount,
      shippingAddress,
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    await publishEvent('order.placed', {
      orderId: order._id,
      userId: order.userId,
      items: order.items,
      totalAmount: order.totalAmount,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/orders
exports.getAll = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.userId };
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/orders/:id
exports.getOne = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isOwner = order.userId === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/orders/:id/status  (admin only)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(422).json({ error: `status must be one of: ${allowed.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await publishEvent('order.status_updated', {
      orderId: order._id,
      userId: order.userId,
      status: order.status,
      timestamp: new Date().toISOString(),
    });

    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
