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
- **gRPC API** - for CarService operations (GetCar, ListCars)

## Technology Stack

- NestJS
- TypeORM
- PostgreSQL
- JWT Authentication
- Swagger API Documentation
- gRPC Microservice

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

4. Start the server:
```bash
npm run start:dev
```
The HTTP server will run on the port specified in your `.env` file (e.g., 3000), and the gRPC server will run on `localhost:50051`.

## API Documentation

The API documentation for the RESTful endpoints is available via Swagger UI at `/api-docs` when the server is running.

### Using Swagger with Authentication

1. Access the Swagger UI at `/api-docs`
2. Log in using the `/auth/google` endpoint (or use the signup flow)
3. After login, copy the JWT token from the URL parameter
4. In Swagger UI, click the "Authorize" button at the top right
5. Enter your JWT token in the format: `Bearer YOUR_TOKEN_HERE`
6. Click "Authorize" and close the dialog
7. Now you can access all protected endpoints through Swagger

### Key API Endpoints (RESTful)

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

## gRPC API

The server also supports gRPC communication for certain services. This can be useful for high-performance internal communication or for clients that prefer gRPC.

### Proto Definition
The Protocol Buffer definition for the gRPC services can be found at:
`src/modules/cars/proto/cars.proto`

### Generating Client Stubs
To interact with the gRPC API, you'll need to generate client stubs from the `.proto` file. The method for doing this depends on your programming language and gRPC tooling.

**For Node.js / TypeScript:**
You can use `grpc-tools` and `@grpc/grpc-js`. First, install the necessary packages:
```bash
npm install grpc-tools @grpc/grpc-js
# or
yarn add grpc-tools @grpc/grpc-js
```
Then, you can generate the client stubs using a command similar to this (run from the project root):
```bash
npx grpc_tools_node_protoc \
    --js_out=import_style=commonjs,binary:./grpc-client \
    --grpc_out=grpc_js:./grpc-client \
    --plugin=protoc-gen-grpc_js=./node_modules/.bin/grpc_tools_node_protoc_plugin \
    src/modules/cars/proto/cars.proto
```
This command will generate JavaScript and gRPC service definition files in a `grpc-client` directory. You might need to adjust paths and output options based on your project structure. For TypeScript, you might also want to generate `.d.ts` files using `protoc-gen-ts`.

**For other languages:**
Refer to the official gRPC documentation for instructions on generating client code for your specific language (e.g., Go, Python, Java, C#). You will typically use `protoc` with the appropriate language-specific plugin.

### Available Services and Methods

**Service:** `cars.CarService`
**gRPC Server Address:** `localhost:50051`

**RPC Methods:**
1.  **`GetCar(GetCarRequest) returns (CarResponse)`**
    *   Retrieves details for a specific car by its ID.
    *   Request: `{ "id": "your-car-id" }`
    *   Response: Contains the car details.

2.  **`ListCars(ListCarsRequest) returns (CarsResponse)`**
    *   Lists available cars. (Currently, no request filters are implemented in the example).
    *   Request: `{}` (empty, as per current proto)
    *   Response: Contains a list of cars.

### Testing with `grpcurl`
If you have `grpcurl` installed, you can use it to interact with the gRPC API from the command line.

**Example: Calling `GetCar`**
```bash
grpcurl -plaintext \
        -proto src/modules/cars/proto/cars.proto \
        -d '{"id": "your-car-id-here"}' \
        localhost:50051 cars.CarService/GetCar
```
Replace `"your-car-id-here"` with an actual car ID from your database.

**Example: Calling `ListCars`**
```bash
grpcurl -plaintext \
        -proto src/modules/cars/proto/cars.proto \
        -d '{}' \
        localhost:50051 cars.CarService/ListCars
```

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
```
