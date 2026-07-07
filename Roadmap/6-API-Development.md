# API Development - Building Scalable APIs

## API Best Practices

### 1. Consistent Response Format

```javascript
// Success response
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": 1,
    "name": "John Doe"
  },
  "message": "User retrieved successfully"
}

// Error response
{
  "success": false,
  "statusCode": 400,
  "error": "Validation failed",
  "message": "Email is required"
}
```

### 2. Proper HTTP Status Codes

```javascript
200 OK              // Successful GET, PUT
201 Created         // Successful POST
204 No Content      // Successful DELETE
400 Bad Request     // Invalid input
401 Unauthorized    // Authentication failed
403 Forbidden       // Insufficient permissions
404 Not Found       // Resource doesn't exist
409 Conflict        // Resource already exists
500 Server Error    // Internal server error
```

---

## Building a User API

### Project Structure

```
src/
├── routes/
│   └── userRoutes.js
├── controllers/
│   └── userController.js
├── models/
│   └── User.js
├── middleware/
│   └── errorHandler.js
├── utils/
│   └── validators.js
└── app.js
```

### Model Definition (User.js)

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      bio: String,
      avatar: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
```

### Controller (userController.js)

```javascript
const User = require("../models/User");

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Create user
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "Email already in use",
      });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
      message: "User updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
```

### Routes (userRoutes.js)

```javascript
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Routes
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
```

### Main App (app.js)

```javascript
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use("/api/users", require("./routes/userRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Authentication

### JWT (JSON Web Token)

```javascript
const jwt = require("jsonwebtoken");

// Generate token
function generateToken(userId) {
  return jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// Verify token middleware
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Use in protected routes
app.get("/api/profile", verifyToken, (req, res) => {
  // Only accessible with valid token
});
```

---

## Error Handling

### Custom Error Class

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
```

### Error Handling Middleware

```javascript
const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    statusCode: status,
    error: message,
  });
};

app.use(errorHandler);
```

---

## API Documentation

Document your API using comments:

```javascript
/**
 * GET /api/users
 * Get all users
 * @returns {Array} Array of user objects
 * @example GET /api/users
 * Response: { success: true, data: [...] }
 */
app.get("/api/users", getUsersHandler);
```

---

## Testing

### Simple Test Example

```javascript
const request = require("supertest");
const app = require("./app");

describe("User API", () => {
  it("should get all users", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should create a user", async () => {
    const res = await request(app).post("/api/users").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(201);
  });
});
```

---

## Summary

✓ Consistent response format
✓ Proper HTTP status codes
✓ Separate controllers, routes, models
✓ Error handling
✓ Authentication with JWT
✓ API documentation
✓ Testing

**Next: Deployment →**
