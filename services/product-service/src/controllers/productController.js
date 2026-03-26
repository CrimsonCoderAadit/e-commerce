const Product = require('../models/Product');
const { getCache, setCache, deleteCacheByPattern } = require('../redis');

// GET /api/products
exports.getAll = async (req, res) => {
  try {
    const cacheKey = 'products:' + JSON.stringify(req.query);
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.set('X-Cache', 'HIT').json(cached);
    }

    const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    const filter = { deletedAt: null };
    if (category) filter.category = category;
    if (search)   filter.$text = { $search: search };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      newest:     { createdAt: -1 },
    };
    const sortOpt = sortMap[sort] || { createdAt: -1 };

    const skip  = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name imageUrl')
        .sort(sortOpt)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    const payload = { products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
    await setCache(cacheKey, payload, 300);
    res.set('X-Cache', 'MISS').json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/:id
exports.getOne = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, deletedAt: null })
      .populate('category', 'name description imageUrl');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/products
exports.create = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    await deleteCacheByPattern('products:*');
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/products/:id
exports.update = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name imageUrl');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await deleteCacheByPattern('products:*');
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/products/:id  (soft delete)
exports.remove = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await deleteCacheByPattern('products:*');
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/products/:id/stock
exports.updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (typeof quantity !== 'number') {
      return res.status(422).json({ error: '`quantity` must be a number' });
    }

    const product = await Product.findOne({ _id: req.params.id, deletedAt: null });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      return res.status(400).json({ error: 'Insufficient stock', available: product.stock });
    }

    product.stock = newStock;
    await product.save();
    await deleteCacheByPattern('products:*');
    res.json({ stock: product.stock });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
