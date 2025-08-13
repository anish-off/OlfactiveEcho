# Backend (Node.js + Express + MongoDB)

Implements authentication, perfume catalog, orders (with sample pricing rule), samples, and placeholder chat endpoint (AI integration to be added separately).

## Environment Variables
Create a `.env` file in `backend/`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=olfactive_echo
JWT_SECRET=replace_with_strong_secret
CORS_ORIGIN=http://localhost:5173
```

## Scripts

Development with auto-restart:
```
npm run dev
```
Production:
```
npm start
```

## API Overview

Auth:
- POST /api/auth/register { name,email,password }
- POST /api/auth/login { email,password }
- GET /api/auth/me (Bearer token)

Perfumes:
- GET /api/perfumes?q=&category=
- GET /api/perfumes/:id
- POST /api/perfumes (admin) body: { name, price, notes, ... }
- PUT /api/perfumes/:id (admin)
- DELETE /api/perfumes/:id (admin)

Samples:
- GET /api/samples
- POST /api/samples (admin)

Orders:
- POST /api/orders { items:[{ perfume, quantity }], sample:{ samplePerfume } }
	- Rule: if total perfume quantity >= 2, sample.price = 0 else 5 (or provided)
- GET /api/orders (user's orders)
- GET /api/orders/all (admin)

Chat (placeholder):
- POST /api/chat { message }

Health:
- GET /api/health

## Sample Order Payload
```
{
	"items": [
		{ "perfume": "664e1c...", "quantity": 1 },
		{ "perfume": "664e1d...", "quantity": 1 }
	],
	"sample": { "samplePerfume": "664e1e..." }
}
```

## Notes
* Chat endpoint is stubbed; integrate AI service later.
* Add indexes / validation as needed for production.
* Add rate limiting & improved error handling for security.
