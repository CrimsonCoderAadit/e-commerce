require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

const ADMIN_ID = '000000000000000000000001';

const categories = [
  { name: 'Electronics',     description: 'Gadgets, devices, and accessories' },
  { name: 'Clothing',        description: 'Apparel for men, women, and children' },
  { name: 'Books',           description: 'Fiction, non-fiction, and textbooks' },
  { name: 'Home & Kitchen',  description: 'Furniture, cookware, and home essentials' },
];

const productsByCat = {
  Electronics: [
    { name: 'Wireless Noise-Cancelling Headphones', description: 'Over-ear headphones with 30h battery and ANC technology.', price: 89.99,  stock: 120 },
    { name: '4K Ultra HD Smart TV 55"',             description: '55-inch 4K display with built-in streaming apps.', price: 499.99, stock: 40  },
    { name: 'Mechanical Keyboard TKL',              description: 'Tenkeyless mechanical keyboard with blue switches and RGB backlight.', price: 64.99,  stock: 200 },
  ],
  Clothing: [
    { name: 'Men\'s Slim-Fit Chinos',   description: 'Stretch cotton chinos available in multiple colours.', price: 34.99, stock: 300 },
    { name: 'Women\'s Running Jacket',  description: 'Lightweight, water-resistant jacket for all-weather running.', price: 59.99, stock: 150 },
    { name: 'Unisex Graphic Tee',       description: '100% organic cotton tee with a minimalist print.', price: 19.99, stock: 500 },
  ],
  Books: [
    { name: 'Clean Code',                      description: 'A handbook of agile software craftsmanship by Robert C. Martin.', price: 29.99, stock: 80  },
    { name: 'The Pragmatic Programmer',        description: '20th Anniversary Edition — timeless lessons for software developers.', price: 34.99, stock: 60  },
    { name: 'Designing Data-Intensive Apps',   description: 'Deep dive into the principles behind reliable, scalable systems.', price: 39.99, stock: 50  },
  ],
  'Home & Kitchen': [
    { name: 'Stainless Steel Cookware Set (10pc)', description: 'Induction-compatible pots and pans with glass lids.', price: 119.99, stock: 75  },
    { name: 'Ergonomic Office Chair',              description: 'Lumbar-support mesh chair with adjustable armrests.', price: 249.99, stock: 35  },
    { name: 'Pour-Over Coffee Maker',              description: 'Borosilicate glass dripper with a reusable stainless filter.', price: 24.99,  stock: 160 },
  ],
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Category.deleteMany({});
  await Product.deleteMany({});
  console.log('Cleared existing data');

  const createdCats = await Category.insertMany(categories);
  console.log(`Inserted ${createdCats.length} categories`);

  const catMap = Object.fromEntries(createdCats.map((c) => [c.name, c._id]));

  const products = Object.entries(productsByCat).flatMap(([catName, items]) =>
    items.map((p) => ({ ...p, category: catMap[catName] }))
  );

  const createdProducts = await Product.insertMany(products);
  console.log(`Inserted ${createdProducts.length} products`);

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
