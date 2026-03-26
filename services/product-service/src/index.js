require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const categoryRoutes = require('./routes/categories');
const productRoutes  = require('./routes/products');

const app  = express();
const PORT = process.env.PORT || 4002;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'product-service', timestamp: new Date().toISOString() }));

app.use('/api/categories', categoryRoutes);
app.use('/api/products',   productRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Product service running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
