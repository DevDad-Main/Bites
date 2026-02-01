# Bites 🍔

A beginner-friendly Express.js API that demonstrates Redis integration through a restaurant management system. This project is perfect for developers who want to learn how to use Redis as a primary database in a Node.js application.

## 🎯 What You'll Learn

- Setting up Redis with Express.js
- Redis data structures: Hashes, Sets, and Lists (Plus more, WIP)
- CRUD operations using Redis commands
- RESTful API design with TypeScript
- Middleware for validation and error handling
- Redis key naming conventions and best practices

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Redis server running on your machine
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/DevDad-Main/Bites.git
   cd Bites
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up your environment
   ```bash
   cp .env.example .env
   # Edit .env with your preferred port and version
   ```

4. Start Redis server (if not already running)
   ```bash
   redis-server
   ```

5. Create Redis search index (required for search functionality)
   ```bash
   pnpm dlx tsx src/seed/createIndex.seed.ts
   ```

6. Run the application
   ```bash
   npm run dev
   ```

Your API will be running at `http://localhost:3000` 🎉

## 📚 API Endpoints

### Restaurants

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/restaurants` | Create a new restaurant |
| `GET` | `/api/v1/restaurants/:restaurantId` | Fetch restaurant details (increments view count) |

### Restaurant Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/restaurants/:restaurantId/reviews` | Add a review to a restaurant |
| `GET` | `/api/v1/restaurants/:restaurantId/reviews` | Get reviews with pagination |
| `DELETE` | `/api/v1/restaurants/:restaurantId/reviews/:reviewId` | Delete a specific review |

### Cuisines

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/cuisines` | Get all available cuisine types |
| `GET` | `/api/v1/cuisines/:cuisineType` | Get restaurants by cuisine type |

### Restaurant Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/restaurants/search?query={text}` | Search restaurants by name using Redis search index |

### Restaurant Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/restaurants/create/{restaurantId}/details` | Create detailed information for a restaurant |
| `GET` | `/api/v1/restaurants/fetch/{restaurantId}/details` | Fetch detailed information for a restaurant |
| `GET` | `/api/v1/restaurants/fetch/{restaurantId}/weather` | Get weather information for restaurant location |
| `GET` | `/api/v1/restaurants/fetch/restaurant-ratings` | Get restaurants sorted by ratings with pagination |

## 💡 Usage Examples

### Create a Restaurant

```bash
curl -X POST http://localhost:3000/api/v1/restaurants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "The Cozy Café",
    "location": "123 Main St, Portland, OR",
    "cuisines": ["italian", "coffee", "pastries"]
  }'
```

### Add a Review

```bash
curl -X POST http://localhost:3000/api/v1/restaurants/{restaurantId}/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Amazing pasta and great atmosphere!",
    "reviewer": "Food Lover"
  }'
```

### Get Restaurant Details

```bash
curl http://localhost:3000/api/v1/restaurants/{restaurantId}
```

### Search Restaurants

```bash
curl "http://localhost:3000/api/v1/restaurants/search?query=italian"
```

## 🏗️ Project Structure

```
src/
├── app.ts                     # Express app configuration
├── server.ts                   # Server startup
├── controllers/                # Route handlers
│   ├── restaurant.controllers.ts
│   └── cuisine.controller.ts
├── middleware/                 # Custom middleware
│   ├── checkRestaurantId.middleware.ts
│   └── validation.middleware.ts
├── routes/                     # API routes
│   ├── restaurants.routes.ts
│   └── cuisine.routes.ts
├── schemas/                    # Zod validation schemas
│   ├── restaurant.schema.ts
│   └── cuisine.schema.ts
└── utils/                      # Utility functions
    ├── getKeys.utils.ts
    └── redisClient.utils.ts
```

## 🔧 Technologies Used

- **Express.js** - Web framework for Node.js
- **Redis** - In-memory data structure store
- **TypeScript** - Type-safe JavaScript
- **Zod** - Schema validation
- **nanoid** - Small, secure, URL-friendly unique string ID generator

## 🎯 Redis Data Patterns

This project demonstrates several Redis patterns:

- **Hashes** (`bites:restaurant:{id}`) - Store restaurant details
- **Sets** (`bites:cuisines`, `bites:cuisines:{type}`) - Manage cuisine types and relationships
- **Lists** (`bites:restaurant:{id}:reviews`) - Store review IDs for pagination
- **Counters** - Track view counts using `HINCRBY`

## 🛠️ Development Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm run start    # Run production build
```

## 📋 Database Setup

### Creating Redis Search Index

This project uses Redis Search for full-text search capabilities. Before using the search functionality, you need to create the search index:

```bash
# From the root directory, run:
pnpm dlx tsx src/seed/createIndex.seed.ts
```

This command will:
- Drop any existing index (safe to run multiple times)
- Create a new search index for restaurants with fields: id, name, and avgStars
- Enable text search on restaurant names and numeric sorting by ratings

**Note**: You only need to run this once during initial setup, or when you want to recreate the index structure.

## 🤝 Contributing

This is a learning project! Feel free to:
- Report issues
- Suggest improvements
- Submit pull requests
- Ask questions about Redis implementation

## 📖 Learning Resources

- [Redis Documentation](https://redis.io/documentation)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---
