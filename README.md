# Rentoro Backend - Car Rental System API

## Overview

This is the backend API for a car rental system that allows car owners to list their vehicles, clients to rent cars, and administrators to manage the platform.

## Features

- **Authentication** with Google SSO and JWT
- **User Management** 
- **Car Management** - listing, searching, and managing cars
- **Rental Process** - making and managing rental requests
- **Payment Handling** - processing payments and refunds
- **Admin Controls** - car validation and platform management

## Technology Stack

- NestJS
- TypeORM
- PostgreSQL
- JWT Authentication
- Swagger API Documentation

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/rentoro-backend.git
cd rentoro-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with the following variables:
```
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=rentoro_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
GOOGLE_SIGNUP_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/signup/callback

# Frontend URLs
FRONTEND_URL=http://localhost:3000
```

4. Run database migrations:
```bash
npm run migration:run
```

5. Start the server:
```bash
npm run start:dev
```

## API Documentation

The API documentation is available via Swagger UI at `/api-docs` when the server is running.

### Using Swagger with Authentication

1. Access the Swagger UI at `/api-docs`
2. Log in using the `/auth/google` endpoint (or use the signup flow)
3. After login, copy the JWT token from the URL parameter
4. In Swagger UI, click the "Authorize" button at the top right
5. Enter your JWT token in the format: `Bearer YOUR_TOKEN_HERE`
6. Click "Authorize" and close the dialog
7. Now you can access all protected endpoints through Swagger

### Key API Endpoints

#### Authentication
- `GET /auth/google` - Initiate Google SSO login flow
- `GET /auth/google/callback` - OAuth callback endpoint for login
- `GET /auth/google/signup` - Initiate Google SSO signup flow 
- `GET /auth/google/signup/callback` - OAuth callback endpoint for signup
- `POST /auth/logout` - User logout
- `POST /auth/refresh-token` - Refresh JWT token

#### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile

#### Cars
- `POST /cars` - Register a new car
- `GET /cars` - List all available cars (with filters)
- `GET /cars/owner` - List all cars registered by current user
- `GET /cars/{carId}` - Get specific car details
- `PUT /cars/{carId}` - Update car details
- `DELETE /cars/{carId}` - Remove car from listings
- `GET /cars/{carId}/validation` - Check validation status
- `GET /cars/{carId}/requests` - View all rental requests for a car
- `PATCH /cars/{carId}/availability` - Update car availability

#### Rental Requests
- `POST /rental-requests` - Create a new rental request
- `GET /rental-requests` - List all rental requests by current user
- `GET /rental-requests/{requestId}` - Get specific rental request details
- `PATCH /rental-requests/{requestId}` - Update rental request
- `DELETE /rental-requests/{requestId}` - Cancel rental request

#### Payments
- `POST /payments` - Create a new payment
- `GET /payments` - List all payments by current user
- `GET /payments/{paymentId}` - Get specific payment details
- `POST /payments/{paymentId}/cancel` - Cancel/refund payment
- `POST /payments/webhook` - Payment gateway webhook

#### Admin
- `GET /admin/validations` - List all pending validations
- `GET /admin/validations/{carId}` - Get specific car validation details
- `POST /admin/validations/{carId}` - Submit validation decision
- `GET /admin/users` - List all users
- `GET /admin/cars` - List all cars
- `GET /admin/rental-requests` - List all rental requests
- `GET /admin/payments` - List all payments

## Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Database Migrations

```bash
# Generate a new migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## Authentication Flows

### Login Flow
1. User clicks "Login with Google" button
2. Frontend redirects to `/auth/google`
3. Backend redirects to Google OAuth
4. User authenticates with Google
5. Google redirects back to `/auth/google/callback`
6. Backend creates/updates user and generates JWT token
7. User is redirected to frontend with token in URL parameter

### Signup Flow
1. User clicks "Sign up with Google" button
2. Frontend redirects to `/auth/google/signup`
3. Backend redirects to Google OAuth
4. User authenticates with Google
5. Google redirects back to `/auth/google/signup/callback`
6. Backend creates/updates user and generates JWT token
7. User is redirected to frontend signup success page with token in URL parameter
