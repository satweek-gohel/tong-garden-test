# Tong Garden Operations

This is an internal operations platform I built for a manufacturing/FMCG business.

The main goal was to keep product, inventory, orders, users, and payments in one place. I also implemented the complete authentication flow with JWT, refresh tokens, role-based access, password reset, email verification, and login rate limiting.

## Tech Stack

| Layer          | Technology                                              |
| -------------- | ------------------------------------------------------- |
| Frontend       | Next.js 15, React 19, TypeScript, Tailwind CSS, Zustand |
| Backend        | FastAPI, Python, SQLAlchemy, Pydantic v2                |
| Database       | PostgreSQL                                              |
| Local/Test DB  | SQLite                                                  |
| Authentication | JWT, httpOnly cookies, bcrypt                           |
| Testing        | Pytest, Vitest                                          |
| DevOps         | Docker, Docker Compose, GitHub Actions                  |
| Code Quality   | ESLint, Ruff                                            |

## Main Modules

The application currently covers:

* User authentication and authorization
* User management
* Product categories
* Product management
* Inventory and stock adjustments
* Inventory history/audit logs
* Order management
* Order items
* Payments
* Password reset
* Email verification

---

## Authentication

I spent quite a bit of time on the authentication flow because I didn't want to simply store JWTs in `localStorage`.

### httpOnly Cookies

Access and refresh tokens are stored in httpOnly cookies.

When a user logs in, the API doesn't return the JWT in the response body. Instead, it sets:

* `access_token`
* `refresh_token`

Both cookies are httpOnly, so frontend JavaScript cannot directly access the tokens.

The access token expires after 15 minutes and the refresh token lasts for 7 days.

### Refresh Token Rotation

Refresh tokens are also stored in the database, but I don't store the actual token value.

I store a SHA-256 hash along with:

* User ID
* Expiration time
* Revoked status

Whenever `/auth/refresh` is called, the current refresh token is checked and then revoked. A new access token and refresh token are generated.

This means an old refresh token can't keep being reused after it has already been rotated.

Logout also revokes the current refresh token.

---

## Handling Frontend and Backend Locally

During development, the frontend runs on port `3000` and FastAPI runs on `8000`.

Since the authentication cookies are SameSite cookies, I didn't want to make the setup unnecessarily complicated by using `SameSite=None` and HTTPS just for local development.

Instead, I use a Next.js rewrite:

```text
Browser
   ↓
localhost:3000/api/*
   ↓
Next.js rewrite
   ↓
FastAPI :8000
```

From the browser's point of view, it is communicating with the same origin, so the authentication cookies work normally.

The same pattern can also work in production when the frontend and backend are placed behind the same domain/reverse proxy.

---

## Route Protection

There are two levels of protection.

### Middleware

The Next.js middleware checks the access token using `jose`.

If the token is valid, the user can continue to the protected page.

If the access token has expired but a refresh token still exists, I allow the request to continue because the API layer can refresh the session.

### API Wrapper

I also have a common API wrapper on the frontend.

When an API request returns `401`, it calls:

```text
/auth/refresh
```

and retries the original request.

So if the access token expires while the user is using the application, they don't immediately get kicked back to the login page.

---

## Role-Based Access

There are currently two roles:

* `user`
* `admin`

The backend is responsible for actually enforcing permissions.

For example:

```text
GET /users
```

is available only to admins.

A normal user gets:

```text
403 Forbidden
```

The frontend also hides admin navigation and shows an access-denied screen, but that is only for the user experience. The actual security check happens on the backend.

### One Known Limitation

For this demo, the registration API allows the user to select their account type.

So technically someone could register themselves as an admin.

I intentionally kept this behavior because it makes testing both roles easier for the interview/demo.

For a real production application, I would not allow public users to choose the admin role. I would handle admin access through an existing admin invitation or another controlled process.

---

## Login Rate Limiting

I added a simple rate limiter to the login endpoint.

If there are more than 5 failed login attempts for the same email within 15 minutes, the API returns:

```text
429 Too Many Requests
```

For this project I'm keeping the failed-attempt tracking in memory.

For a multi-server production setup, I would move this to Redis so all application instances share the same rate-limit state.

---

## Password Reset & Email Verification

I also implemented password reset and email verification.

There isn't an actual email provider connected because this is an interview/demo project, so emails are currently mocked and printed to the backend console.

### Email Verification

The flow is:

```text
Register
   ↓
Verification token generated
   ↓
Email/link mocked in backend
   ↓
/verify-email?token=...
   ↓
Account verified
```

### Password Reset

Password reset uses a 6-digit OTP:

```text
Forgot Password
   ↓
Enter email
   ↓
OTP generated
   ↓
Enter OTP
   ↓
Set new password
```

The token information is stored in the database and expires after a limited period.

For testing, the API returns the verification link or OTP when `DEBUG=true`.

Those development values are not returned when running in production mode.

When a password is reset, existing refresh tokens for that user are also revoked so old sessions don't remain active.

---

## Database

The main entities are:

```text
Users
Categories
Products
Inventory Logs
Orders
Order Items
Payments
Refresh Tokens
Email Tokens
```

Products contain stock and reorder information, and stock changes are recorded in inventory logs so there is an audit trail of adjustments.

PostgreSQL is used for the main application, while SQLite can be used for local development and tests.

---

## Unverified Users

I didn't block unverified users from accessing the entire application.

Instead, verification is required for actions that create or modify important business data, such as creating products or orders.

This keeps the demo usable while still showing how verification-based access can be implemented.

---

# Running the Project

## Backend

```bash
cd backend

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

cp .env.example .env

uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

Health check:

```text
GET /health
```

---

## Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

The frontend `.env` contains two server-side variables:

```env
BACKEND_INTERNAL_URL=http://127.0.0.1:8000
JWT_SECRET=your-secret
```

`BACKEND_INTERNAL_URL` is used by the Next.js rewrite to forward API requests to FastAPI.

I use `127.0.0.1` instead of `localhost` here because on some systems `localhost` resolves to IPv6 (`::1`) while the FastAPI server is listening on IPv4.

`JWT_SECRET` needs to match the backend's `SECRET_KEY` because the Next.js middleware verifies the JWT signature itself.

---

# API Overview

### Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Password & Verification

```text
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/resend-verification
POST /api/v1/auth/verify-email
```

### Users

```text
GET    /api/v1/users
GET    /api/v1/users/{id}
PUT    /api/v1/users/{id}
DELETE /api/v1/users/{id}
```

`GET /users` is admin-only.

### Products & Categories

```text
GET   /api/v1/products
POST  /api/v1/products

GET   /api/v1/categories
POST  /api/v1/categories

PATCH /api/v1/products/{id}/stock
```

Stock updates also create an inventory log.

### Orders

```text
GET  /api/v1/orders
POST /api/v1/orders

POST /api/v1/orders/{id}/items
POST /api/v1/orders/{id}/payment
```

---

# Testing

The backend currently has 46 Pytest tests and the frontend has 16 Vitest tests.

Run the frontend checks with:

```bash
npm run test
npm run lint
npm run type-check
```

The main things covered by the tests include authentication, authorization, protected endpoints, refresh tokens, and core application flows.
# tong-garden-test
