# Quick Start - Express Server Template

## Basic Server Setup

```javascript
// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});
```

## .env File Template

```
# Server
PORT=3000
HOST=localhost
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/myapp
# For PostgreSQL:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=password
# DB_NAME=myapp

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this

# CORS
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

## package.json Template

```json
{
  "name": "backend-app",
  "version": "1.0.0",
  "description": "Backend application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "lint": "eslint ."
  },
  "keywords": ["backend", "api", "express"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.0",
    "dotenv": "^16.0.0",
    "mongoose": "^6.0.0",
    "cors": "^2.8.5",
    "helmet": "^5.0.0",
    "jsonwebtoken": "^8.5.1",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.0",
    "jest": "^27.0.0",
    "supertest": "^6.1.0",
    "eslint": "^7.32.0"
  }
}
```

---

## Installation & Setup

```bash
# Create project directory
mkdir my-backend-app
cd my-backend-app

# Initialize npm
npm init -y

# Install dependencies
npm install express dotenv cors helmet jsonwebtoken bcryptjs mongoose

# Install dev dependencies
npm install -D nodemon jest supertest eslint

# Create necessary files
touch server.js .env .gitignore

# Create directories
mkdir src/routes src/controllers src/models src/middleware src/utils

# Start development server
npm run dev
```

---

## MongoDB Connection Template

```javascript
// database.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

Add to server.js:

```javascript
const connectDB = require("./database");
connectDB();
```

---

## User Model Template (Mongoose)

```javascript
// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  avatar: String,
  bio: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
```

---

## User Routes Template

```javascript
// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
```

---

## .gitignore Template

```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/

# Logs
logs/
*.log

# Testing
coverage/
.nyc_output/

# Temporary
temp/
tmp/
```

---

This is your starting point. Customize based on your project needs!
