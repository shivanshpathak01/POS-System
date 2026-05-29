MITRA Enterprise assessment scaffold built with Next.js, TypeScript, MongoDB, and JWT authentication.

## Scope in this branch

Day 1:

- Project setup
- MongoDB schema foundation
- Authentication module

Day 2:

- Product management APIs
- Category APIs
- POS interface

## Environment

Create a local `.env` file from `.env.example` with:

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

## API routes

- `POST /api/auth/logout`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/categories`
- `POST /api/categories`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/products`
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/pos/orders`
- `POST /api/pos/orders`

## Run

```bash
npm install
npm run dev
```
