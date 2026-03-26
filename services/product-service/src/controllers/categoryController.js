const Category = require('../models/Category');

exports.getAll = async (_req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
