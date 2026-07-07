# Express.js Basics

## What is Express.js?

Express.js is a minimal and flexible Node.js web application framework that provides:

- Routing system
- Middleware support
- Request/Response handling
- Easy template engines integration
- Error handling

---

## Basic Express Server Setup

### Installation

```bash
npm install express
npm install -D nodemon  # For auto-reload during development
```

### Hello World Example

```javascript
const express = require("express");
const app = express();
const PORT = 3000;

// Route handler
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### With TypeScript

```typescript
import express, { Express, Request, Response } from "express";

const app: Express = express();
const PORT: number = 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## Routing

### HTTP Methods in Express

```javascript
// GET - Retrieve data
app.get("/users", (req, res) => {
  res.json({ users: [] });
});

// POST - Create data
app.post("/users", (req, res) => {
  res.json({ message: "User created" });
});

// PUT - Update entire resource
app.put("/users/:id", (req, res) => {
  res.json({ message: "User updated" });
});

// DELETE - Delete data
app.delete("/users/:id", (req, res) => {
  res.json({ message: "User deleted" });
});
```

### Route Parameters

```javascript
// URL: /users/123
app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  res.json({ userId: userId });
});

// Multiple parameters
app.get("/users/:userId/posts/:postId", (req, res) => {
  const { userId, postId } = req.params;
  res.json({ userId, postId });
});
```

### Query Parameters

```javascript
// URL: /search?name=john&age=25
app.get("/search", (req, res) => {
  const { name, age } = req.query;
  res.json({ name, age });
});
```

---

## Middleware

Middleware functions have access to request and response objects, and the next middleware function.

### Using Middleware

```javascript
// Built-in middleware for JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next(); // Pass to next middleware
});

// Route-specific middleware
app.get("/protected", (req, res, next) => {
  if (req.headers.authorization) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});
```

### Middleware Order Matters

```javascript
// Middleware executes in order
app.use(express.json()); // 1st
app.use(authenticate); // 2nd
app.get("/route", handler); // 3rd - Handler
```

---

## Request Object (req)

| Property/Method | Purpose                      |
| --------------- | ---------------------------- |
| `req.params`    | Route parameters             |
| `req.query`     | Query string parameters      |
| `req.body`      | Request body (POST data)     |
| `req.headers`   | HTTP headers                 |
| `req.method`    | HTTP method (GET, POST, etc) |
| `req.path`      | URL path                     |

---

## Response Object (res)

| Method           | Purpose                        |
| ---------------- | ------------------------------ |
| `res.send()`     | Send response (string or HTML) |
| `res.json()`     | Send JSON response             |
| `res.status()`   | Set HTTP status code           |
| `res.sendFile()` | Send file                      |
| `res.redirect()` | Redirect to another URL        |

---

## Error Handling

```javascript
// Try-catch in route handlers
app.get("/data", async (req, res) => {
  try {
    const data = await fetchData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});
```

---

## Environment Variables

```javascript
// Install dotenv: npm install dotenv
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
```

**.env file:**

```
PORT=3000
NODE_ENV=development
DB_URL=mongodb://localhost:27017
```

---

## Project Structure

```
project/
├── src/
│   ├── routes/
│   │   ├── users.js
│   │   └── posts.js
│   ├── middleware/
│   │   └── auth.js
│   └── app.js
├── .env
├── .gitignore
├── package.json
└── server.js
```

---

## package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "build": "tsc"
  }
}
```

```bash
npm run dev    # Development with auto-reload
npm start      # Production
npm test       # Run tests
```

---

## Summary

✓ Express provides routing and middleware
✓ Middleware processes requests in order
✓ Request/Response objects carry data
✓ Error handling is crucial
✓ Environment variables for configuration

**Next: Database Setup →**
