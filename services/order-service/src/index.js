require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const mongoose = require('mongoose');

const { connect: connectRabbitMQ } = require('./rabbitmq');
const cartRoutes  = require('./routes/cart');
const orderRoutes = require('./routes/orders');

const app  = express();
const PORT = process.env.PORT || 4003;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'order-service', timestamp: new Date().toISOString() }));

app.use('/api/cart',   cartRoutes);
app.use('/api/orders', orderRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    connectRabbitMQ();
    app.listen(PORT, () => console.log(`Order service running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
