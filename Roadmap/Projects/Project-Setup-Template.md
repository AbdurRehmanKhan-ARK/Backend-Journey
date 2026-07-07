# Project Setup Template

Use this template to quickly start any of the projects.

---

## Step-by-Step Project Setup

### 1. Create Project Directory

```bash
mkdir my-project-name
cd my-project-name
```

### 2. Initialize Git

```bash
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 3. Initialize Node Project

```bash
npm init -y
```

### 4. Create Folder Structure

```bash
mkdir src
mkdir src/routes
mkdir src/controllers
mkdir src/models
mkdir src/middleware
mkdir src/utils
mkdir src/config
mkdir tests
```

### 5. Create Essential Files

```bash
# Create main server file
echo. > src/server.js

# Create main app file
echo. > src/app.js

# Create environment file
echo. > .env

# Create gitignore
echo. > .gitignore
```

### 6. Install Dependencies

**For MongoDB project:**

```bash
npm install express cors helmet dotenv mongoose
npm install -D nodemon eslint jest supertest
```

**For PostgreSQL project:**

```bash
npm install express cors helmet dotenv sequelize pg pg-hstore
npm install -D nodemon eslint jest supertest
```

### 7. Create .gitignore

```
node_modules/
npm-debug.log*
.env
.env.local
.DS_Store
dist/
build/
```

### 8. Create .env Template

```
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/my_db
# OR for PostgreSQL
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=my_db
# DB_USER=postgres
# DB_PASSWORD=password

# JWT
JWT_SECRET=your_super_secret_key_here

# Others
API_URL=http://localhost:3000
```

### 9. Setup package.json Scripts

Edit package.json:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "lint": "eslint ."
  }
}
```

### 10. Create Basic Server File (src/server.js)

```javascript
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### 11. Create App File (src/app.js)

```javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message,
  });
});

module.exports = app;
```

### 12. Setup Database Connection

**For MongoDB (src/config/database.js):**

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

Add to src/server.js:

```javascript
const connectDB = require("./config/database");
connectDB();
```

### 13. Test the Setup

```bash
npm run dev
```

Should see: `🚀 Server running on port 3000`

---

## Checklist Before Coding Features

- [ ] Project directory created
- [ ] Git initialized
- [ ] npm initialized
- [ ] Dependencies installed
- [ ] Folder structure created
- [ ] .env file created
- [ ] .gitignore created
- [ ] Server running successfully
- [ ] Database connected (if applicable)

---

## Useful Development Commands

```bash
# Development
npm run dev                 # Start with auto-reload

# Production
npm start                   # Start server

# Testing
npm test                    # Run tests

# Linting
npm run lint                # Check code style

# Git
git add .                   # Stage changes
git commit -m "message"     # Commit
git push origin main        # Push to GitHub
```

---

## Project-Specific Setup

### For Todo API

- [ ] Single User collection (optional)
- [ ] Todo model with title, description, completed fields
- [ ] Basic CRUD endpoints

### For Blog API

- [ ] User model (Author)
- [ ] Post model with author reference
- [ ] Comment model with post reference
- [ ] Pagination support

### For Social Media

- [ ] User model with auth
- [ ] Tweet model
- [ ] Relationship tracking (followers)
- [ ] JWT middleware

### For E-commerce

- [ ] PostgreSQL recommended
- [ ] Product, Category, Cart, Order models
- [ ] Stripe integration
- [ ] Admin role support

### For Hospital

- [ ] PostgreSQL recommended
- [ ] Patient, Doctor, Appointment models
- [ ] Role-based access control
- [ ] Complex relationships

---

## Testing Your First Endpoint

1. Start your server: `npm run dev`
2. Open Postman/Insomnia
3. Create GET request to `http://localhost:3000/api/health`
4. Should return: `{ "status": "OK" }`

---

## Git First Commit

```bash
git add .
git commit -m "Initial project setup"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

**You're ready to start building! Begin with your first feature. 🚀**

Last Updated: 2026-07-07
