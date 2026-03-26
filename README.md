# ShopEase — Microservices E-Commerce Platform

A production-ready e-commerce application built with a Node.js microservices architecture, React frontend, and Docker.

---

## Architecture

```
┌─────────────┐     ┌──────────────────────────────────────────────┐
│   Browser   │────▶│           Nginx Gateway  (:80)               │
└─────────────┘     └──────┬──────────┬──────────┬────────────────┘
                           │          │          │
                    /api/auth   /api/products  /api/orders|cart
                           │          │          │
               ┌───────────▼─┐ ┌──────▼──────┐ ┌▼──────────────┐
               │ auth-service│ │product-svc  │ │ order-service │
               │   :4001     │ │   :4002     │ │    :4003      │
               └──────┬──────┘ └──────┬──────┘ └──────┬────────┘
                      │               │               │
                   MongoDB         MongoDB +        MongoDB +
                  (auth_db)      Redis cache      RabbitMQ publish
                                  (product_db)      (order_db)
                                                        │
                                              ┌─────────▼──────────┐
                                              │ notification-svc   │
                                              │  (RabbitMQ worker) │
                                              │  Sends email via   │
                                              │  Nodemailer/SMTP   │
                                              └────────────────────┘
```

| Service              | Port  | Purpose                                      |
|----------------------|-------|----------------------------------------------|
| auth-service         | 4001  | JWT auth, register, login, refresh, logout   |
| product-service      | 4002  | Product & category CRUD, Redis cache         |
| order-service        | 4003  | Cart management, order checkout              |
| notification-service | —     | Background worker — sends order emails       |
| gateway (nginx)      | 80    | Reverse proxy for all services               |
| frontend (React)     | 5173  | Vite dev / nginx production                  |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) >= 24
- [Docker Compose](https://docs.docker.com/compose/) >= 2.20 (bundled with Docker Desktop)
- Node.js 20+ (only needed for local development outside Docker)

---

## Quick Start (Docker Compose)

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd ecommerce

# 2. Copy env files (edit values as needed)
cp services/auth-service/.env.example        services/auth-service/.env
cp services/product-service/.env.example     services/product-service/.env
cp services/order-service/.env.example       services/order-service/.env
cp services/notification-service/.env.example services/notification-service/.env

# 3. Build and start all services
docker-compose up --build

# The app is now available at:
#   http://localhost        -> Frontend (via Nginx gateway)
#   http://localhost/api/*  -> API routes
#   http://localhost:15672  -> RabbitMQ management UI (guest/guest)
```

> Hot-reload dev mode: docker-compose.override.yml is applied automatically.
> Source code changes reflect immediately without rebuilding.

### Useful Commands

```bash
# Start in background
docker-compose up -d --build

# View logs for a specific service
docker-compose logs -f auth-service

# Stop all services
docker-compose down

# Stop and remove volumes (wipes all data)
docker-compose down -v

# Rebuild a single service
docker-compose up --build product-service
```

---

## Seeding the Database

The product service includes a seeder that inserts 4 categories and 12 sample products.

```bash
# Run seeder (while docker-compose is running)
docker-compose exec product-service node src/seed.js

# Or run locally (requires MONGO_URI in environment)
cd services/product-service
MONGO_URI=mongodb://localhost:27017/product_db node src/seed.js
```

---

## Creating the First Admin User

There is no admin registration endpoint by design. To promote a user to admin:

```bash
# 1. Register a normal account via the app or API:
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"password123"}'

# 2. Connect to MongoDB and update the role:
docker-compose exec mongo mongosh auth_db \
  --eval 'db.users.updateOne({email:"admin@example.com"},{$set:{role:"admin"}})'
```

---

## Environment Variables

### services/auth-service/.env

| Variable             | Description                              | Example                          |
|----------------------|------------------------------------------|----------------------------------|
| PORT                 | Port the service listens on              | 4001                             |
| MONGO_URI            | MongoDB connection string                | mongodb://mongo:27017/auth_db    |
| JWT_ACCESS_SECRET    | Secret for signing access tokens (15m)   | long random string               |
| JWT_REFRESH_SECRET   | Secret for signing refresh tokens (7d)   | different long random string     |
| FRONTEND_URL         | Allowed CORS origin                      | http://localhost:5173            |
| NODE_ENV             | development or production                | development                      |

### services/product-service/.env

| Variable            | Description                        | Example                             |
|---------------------|------------------------------------|-------------------------------------|
| PORT                | Port the service listens on        | 4002                                |
| MONGO_URI           | MongoDB connection string          | mongodb://mongo:27017/product_db    |
| JWT_ACCESS_SECRET   | Must match auth-service secret     | same as auth-service                |
| REDIS_URL           | Redis connection string            | redis://redis:6379                  |
| NODE_ENV            | development or production          | development                         |

### services/order-service/.env

| Variable            | Description                       | Example                            |
|---------------------|-----------------------------------|------------------------------------|
| PORT                | Port the service listens on       | 4003                               |
| MONGO_URI           | MongoDB connection string         | mongodb://mongo:27017/order_db     |
| JWT_ACCESS_SECRET   | Must match auth-service secret    | same as auth-service               |
| RABBITMQ_URL        | RabbitMQ connection string        | amqp://guest:guest@rabbitmq:5672   |
| NODE_ENV            | development or production         | development                        |

### services/notification-service/.env

| Variable             | Description                     | Example                            |
|----------------------|---------------------------------|------------------------------------|
| RABBITMQ_URL         | RabbitMQ connection string      | amqp://guest:guest@rabbitmq:5672   |
| NOTIFICATION_EMAIL   | Recipient for order emails      | test@example.com                   |
| SMTP_HOST            | SMTP server hostname (optional) | smtp.ethereal.email                |
| SMTP_PORT            | SMTP port (optional)            | 587                                |
| SMTP_USER            | SMTP username (optional)        | auto-generated Ethereal if blank   |
| SMTP_PASS            | SMTP password (optional)        | auto-generated Ethereal if blank   |

---

## API Reference

### Auth — /api/auth

| Method | Path        | Auth         | Description                                   |
|--------|-------------|--------------|-----------------------------------------------|
| POST   | /register   | None         | Create a new customer account                 |
| POST   | /login      | None         | Login, returns accessToken + sets cookie      |
| POST   | /refresh    | Cookie       | Issue new accessToken from refresh cookie     |
| POST   | /logout     | Cookie       | Invalidate refresh token, clear cookie        |
| GET    | /me         | Bearer token | Get current authenticated user               |

### Products — /api/products

| Method | Path           | Auth         | Description                                                    |
|--------|----------------|--------------|----------------------------------------------------------------|
| GET    | /              | None         | List products (?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=) |
| GET    | /:id           | None         | Get single product with populated category                     |
| POST   | /              | Admin        | Create a product                                               |
| PUT    | /:id           | Admin        | Update a product                                               |
| DELETE | /:id           | Admin        | Soft-delete a product                                          |
| PATCH  | /:id/stock     | Admin        | Adjust stock { quantity: number }                              |

### Categories — /api/categories

| Method | Path   | Auth  | Description         |
|--------|--------|-------|---------------------|
| GET    | /      | None  | List all categories |
| POST   | /      | Admin | Create a category   |
| DELETE | /:id   | Admin | Delete a category   |

### Cart — /api/cart

| Method | Path      | Auth         | Description                                |
|--------|-----------|--------------|--------------------------------------------|
| GET    | /         | Bearer token | Get current user's cart                    |
| POST   | /add      | Bearer token | Add item to cart                           |
| POST   | /update   | Bearer token | Update item quantity (0 = remove)          |
| POST   | /remove   | Bearer token | Remove specific item                       |
| DELETE | /clear    | Bearer token | Empty the cart                             |

### Orders — /api/orders

| Method | Path          | Auth         | Description                                  |
|--------|---------------|--------------|----------------------------------------------|
| POST   | /checkout     | Bearer token | Create order from cart, fires RabbitMQ event |
| GET    | /             | Bearer token | Get current user's order history             |
| GET    | /:id          | Bearer token | Get a single order (owner or admin only)     |
| PATCH  | /:id/status   | Admin        | Update order status                          |

---

## Deployment on Render

### Prerequisites

1. **MongoDB Atlas** — create a free M0 cluster at mongodb.com/atlas. Copy the connection string.
2. **CloudAMQP** — create a free Little Lemur instance at cloudamqp.com. Copy the AMQP URL.
3. **GitHub** — push this repository to GitHub.

### Steps

```bash
# Push to GitHub
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

1. Go to dashboard.render.com -> New -> Blueprint.
2. Connect your GitHub repo — Render detects render.yaml automatically.
3. Set the sync: false environment variables in the Render dashboard:

| Service                | Variable           | Value                          |
|------------------------|--------------------|--------------------------------|
| shopease-auth          | MONGO_URI          | MongoDB Atlas connection string |
| shopease-auth          | FRONTEND_URL       | Your Render frontend URL       |
| shopease-products      | MONGO_URI          | MongoDB Atlas connection string |
| shopease-products      | JWT_ACCESS_SECRET  | Copy from shopease-auth        |
| shopease-orders        | MONGO_URI          | MongoDB Atlas connection string |
| shopease-orders        | JWT_ACCESS_SECRET  | Copy from shopease-auth        |
| shopease-orders        | RABBITMQ_URL       | CloudAMQP AMQP URL             |
| shopease-notifications | RABBITMQ_URL       | CloudAMQP AMQP URL             |
| shopease-notifications | NOTIFICATION_EMAIL | Your email address             |

4. Click Apply — Render builds and deploys all services.

### Health Check URLs

```
https://shopease-auth.onrender.com/health
https://shopease-products.onrender.com/health
https://shopease-orders.onrender.com/health
```

> Note: Free-tier Render services spin down after 15 minutes of inactivity.
> Upgrade to a paid plan for always-on deployments.
