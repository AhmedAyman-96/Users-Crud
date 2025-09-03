# User Management API

A comprehensive Node.js RESTful API for managing users with MongoDB data storage and Redis caching. Built with TypeScript, Express.js, and follows modern development practices.

## Features

- **RESTful API**: Complete CRUD operations for user management
- **TypeScript**: Full type safety and modern JavaScript features
- **MongoDB Integration**: Robust data persistence with Mongoose ODM
- **Redis Caching**: High-performance caching with 3-second TTL
- **Input Validation**: Comprehensive validation using Joi
- **Swagger Documentation**: Auto-generated API documentation
- **Docker Support**: Containerized deployment with Docker Compose
- **Unit Testing**: Comprehensive test coverage with Jest
- **Error Handling**: Robust error handling and logging

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Express.js    │    │    MongoDB      │    │     Redis       │
│   REST API      │◄──►│   User Data     │    │    Cache        │
│                 │    │   Storage       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Swagger UI    │
│ Documentation   │
└─────────────────┘
```

## Requirements

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)
- MongoDB (local or Docker)
- Redis (local or Docker)

## Installation & Setup

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd user-management-api
   ```

2. **Start all services**

   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - API: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs

### Option 2: Local Development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB and Redis**

   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   docker run -d -p 6379:6379 --name redis redis:7.0-alpine
   ```

4. **Build and run the application**

   ```bash
   npm run build
   npm start
   ```

5. **Development mode**
   ```bash
   npm run dev
   ```

## Testing

```bash
# Run all tests
npm test

```

## API Endpoints

### Base URL: `http://localhost:3000/api/v1`

### Users

| Method | Endpoint     | Description            |
| ------ | ------------ | ---------------------- |
| GET    | `/users`     | Get all users (cached) |
| GET    | `/users/:id` | Get user by ID         |
| POST   | `/users`     | Create new user        |
| PATCH  | `/users/:id` | Update user by ID      |
| DELETE | `/users/:id` | Delete user by ID      |

### Documentation

| Method | Endpoint         | Description           |
| ------ | ---------------- | --------------------- |
| GET    | `/api-docs`      | Swagger UI            |
| GET    | `/api-docs.json` | OpenAPI specification |

## Configuration

### Environment Variables

| Variable            | Default                            | Description            |
| ------------------- | ---------------------------------- | ---------------------- |
| `PORT`              | `3000`                             | Server port            |
| `NODE_ENV`          | `development`                      | Environment mode       |
| `MONGODB_URI`       | `mongodb://localhost:27017/userdb` | MongoDB connection URI |
| `REDIS_URL`         | `redis://localhost:6379`           | Redis connection URL   |
| `CACHE_TTL_SECONDS` | `3`                                | Cache expiration time  |

### Sample .env file

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/userdb
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=3
```

## API Usage Examples

### Create a User

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }'
```

### Get All Users

```bash
curl http://localhost:3000/api/v1/users
```

### Get User by ID

```bash
curl http://localhost:3000/api/v1/users/60d5ecb54bbb4c001f8b4567
```

### Update a User

```bash
curl -X PATCH http://localhost:3000/api/v1/users/60d5ecb54bbb4c001f8b4567 \
  -H "Content-Type: application/json" \
  -d '{
    "age": 31
  }'
```

### Delete a User

```bash
curl -X DELETE http://localhost:3000/api/v1/users/60d5ecb54bbb4c001f8b4567
```

## Docker Commands

### Development

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Production

```bash
# Build for production
docker-compose -f docker-compose.yml up --build -d

# Scale the application
docker-compose up -d --scale app=3
```

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.ts   # MongoDB connection
│   ├── redis.ts      # Redis connection
│   └── environment.ts # Environment variables
├── controllers/      # Route controllers
│   └── UserController.ts
├── middleware/       # Express middleware
│   └── validation.ts # Input validation
├── models/          # Mongoose models
│   └── User.ts      # User schema
├── routes/          # API routes
│   └── userRoutes.ts
├── services/        # Business logic
│   └── UserService.ts
├── utils/           # Utility functions
└── server.ts        # Application entry point

tests/               # Unit tests
docker-compose.yml   # Docker orchestration
Dockerfile          # Container definition
```

## Monitoring & Debugging

### Logs

```bash
# Application logs
docker-compose logs -f app

# All services logs
docker-compose logs -f
```
