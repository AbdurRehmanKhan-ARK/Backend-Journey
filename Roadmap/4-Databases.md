# Database Setup and Selection

## Database Types

### Relational Databases (SQL)

**PostgreSQL**

- Open source
- Highly reliable
- Advanced features
- Best for: Complex queries, structured data
- Installation: `brew install postgresql` or download installer

**MySQL**

- Popular and widely used
- Simple and fast
- Good for web applications
- Installation: `brew install mysql` or download MySQL Community Server

**SQLite**

- Lightweight, file-based
- No server needed
- Best for: Development, small projects, embedded use

---

### NoSQL Databases

**MongoDB**

- Document-based
- Flexible schema
- Horizontal scalability
- Best for: Flexible data structures, rapid development
- Installation: `brew install mongodb-community` or use MongoDB Atlas (cloud)

---

## SQL vs NoSQL Comparison

| Aspect         | SQL             | NoSQL                 |
| -------------- | --------------- | --------------------- |
| Schema         | Fixed           | Flexible              |
| Scalability    | Vertical        | Horizontal            |
| Transactions   | ACID            | Eventually Consistent |
| Relationships  | Foreign Keys    | Documents/Nesting     |
| Query Language | SQL             | Database Specific     |
| Best For       | Structured Data | Unstructured Data     |

---

## Setting Up PostgreSQL

### Installation and Setup

```bash
# macOS
brew install postgresql

# Windows - Download installer from postgresql.org
# Linux (Ubuntu)
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL
sudo service postgresql start

# Connect to PostgreSQL
psql -U postgres
```

### Creating Database and User

```sql
-- Create database
CREATE DATABASE my_backend_db;

-- Create user
CREATE USER backend_user WITH PASSWORD 'secure_password';

-- Grant privileges
ALTER ROLE backend_user SET client_encoding TO 'utf8';
ALTER ROLE backend_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE backend_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE my_backend_db TO backend_user;
```

---

## Setting Up MongoDB

### Installation

```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Windows - Download installer from mongodb.com
# Linux - Follow MongoDB community edition guide
```

### Basic MongoDB Commands

```bash
# Connect to MongoDB
mongosh

# Create database (automatic on first use)
use my_backend_db

# Create collection (automatic on first use)
db.users.insertOne({ name: "John", email: "john@example.com" })

# Query
db.users.find()

# Update
db.users.updateOne({ _id: ObjectId(...) }, { $set: { name: "Jane" } })

# Delete
db.users.deleteOne({ _id: ObjectId(...) })
```

---

## Connecting to Database from Node.js

### PostgreSQL with pg library

```javascript
const { Pool } = require("pg");

const pool = new Pool({
  user: "backend_user",
  password: "secure_password",
  host: "localhost",
  port: 5432,
  database: "my_backend_db",
});

// Query
pool.query("SELECT * FROM users", (err, result) => {
  if (err) {
    console.error(err);
  } else {
    console.log(result.rows);
  }
});
```

### MongoDB with mongoose

```javascript
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/my_backend_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});
```

---

## Basic Schema Design

### For Relational Databases

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### For MongoDB

```javascript
const userSchema = {
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  createdAt: Date,
  updatedAt: Date,
};

const postSchema = {
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  content: String,
  createdAt: Date,
};
```

---

## Choosing Your Database

**Choose PostgreSQL/MySQL if:**

- ✓ Data has clear structure
- ✓ Need complex queries
- ✓ Need ACID transactions
- ✓ Complex relationships between data

**Choose MongoDB if:**

- ✓ Schema might evolve
- ✓ Rapid prototyping
- ✓ Unstructured/semi-structured data
- ✓ Need horizontal scaling

---

## Environment Configuration

```javascript
// config.js
require("dotenv").config();

const config = {
  database: {
    type: process.env.DB_TYPE || "postgresql",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
  },
};

module.exports = config;
```

---

## Summary

✓ SQL databases: PostgreSQL, MySQL (structured data)
✓ NoSQL databases: MongoDB (flexible data)
✓ Choose based on project needs
✓ Setup environment variables
✓ Next: Use ORM/ODM for database interactions

**Next: ORM/ODM Integration →**
