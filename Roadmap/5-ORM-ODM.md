# ORM/ODM - Object Relational/Document Mapping

## What is ORM/ODM?

**ORM (Object-Relational Mapping)**

- Maps database tables to JavaScript classes/objects
- Used with SQL databases (PostgreSQL, MySQL)
- Examples: Sequelize, TypeORM

**ODM (Object-Document Mapping)**

- Maps MongoDB documents to JavaScript objects
- Used with NoSQL databases
- Example: Mongoose

Benefits:

- Write database logic in JavaScript instead of SQL
- Data validation
- Type safety
- Relationships handling
- Query builder

---

## Mongoose (MongoDB ODM)

### Installation

```bash
npm install mongoose
```

### Basic Setup

```javascript
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/my_backend_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.on("error", console.error.bind(console, "connection error:"));
connection.once("open", () => {
  console.log("Connected to MongoDB");
});
```

### Defining Schemas and Models

```javascript
// Define schema
const userSchema = new mongoose.Schema({
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
    minlength: 6,
  },
  age: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create model
const User = mongoose.model("User", userSchema);

module.exports = User;
```

### CRUD Operations with Mongoose

```javascript
const User = require("./models/User");

// CREATE
const newUser = new User({
  name: "John Doe",
  email: "john@example.com",
  password: "hashedPassword123",
});

newUser
  .save()
  .then((user) => console.log("User created:", user))
  .catch((err) => console.error("Error:", err));

// Or using async/await
async function createUser() {
  const user = await User.create({
    name: "Jane Doe",
    email: "jane@example.com",
    password: "hashedPassword456",
  });
  return user;
}

// READ - Find one
const user = await User.findById(userId);
const user = await User.findOne({ email: "john@example.com" });

// READ - Find all
const users = await User.find();
const users = await User.find({ age: { $gt: 18 } }); // age > 18

// UPDATE
await User.findByIdAndUpdate(userId, { name: "New Name" }, { new: true });

// DELETE
await User.findByIdAndDelete(userId);
```

---

## Sequelize (SQL ORM for PostgreSQL/MySQL)

### Installation

```bash
npm install sequelize pg pg-hstore
# For MySQL: npm install sequelize mysql2
```

### Basic Setup

```javascript
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("my_backend_db", "backend_user", "password", {
  host: "localhost",
  dialect: "postgres", // or 'mysql'
});

// Test connection
sequelize
  .authenticate()
  .then(() => console.log("Connection successful"))
  .catch((err) => console.error("Connection failed:", err));

module.exports = sequelize;
```

### Defining Models

```javascript
const { DataTypes } = require("sequelize");
const sequelize = require("./database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = User;
```

### CRUD Operations with Sequelize

```javascript
// CREATE
const user = await User.create({
  name: "John Doe",
  email: "john@example.com",
  password: "hashedPassword",
});

// READ
const user = await User.findByPk(userId);
const users = await User.findAll();
const user = await User.findOne({ where: { email: "john@example.com" } });

// UPDATE
await user.update({ name: "New Name" });
// Or:
await User.update({ name: "New Name" }, { where: { id: userId } });

// DELETE
await user.destroy();
// Or:
await User.destroy({ where: { id: userId } });
```

---

## Relationships

### Mongoose - References

```javascript
// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

// Post schema with reference
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

// Query with populate
const post = await Post.findById(postId).populate("author");
console.log(post.author.name); // Can access author details
```

### Sequelize - Associations

```javascript
// Define relationship
User.hasMany(Post, { foreignKey: "userId" });
Post.belongsTo(User, { foreignKey: "userId" });

// Query with include
const user = await User.findByPk(userId, {
  include: [Post],
});
console.log(user.Posts); // Array of posts by this user
```

---

## Validation

### Mongoose Validation

```javascript
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [/.+@.+\..+/, "Invalid email format"],
  },
  age: {
    type: Number,
    min: [0, "Age cannot be negative"],
    max: [150, "Age is too high"],
  },
});

// Custom validation
userSchema.pre("save", function (next) {
  if (this.password.length < 6) {
    next(new Error("Password must be at least 6 characters"));
  } else {
    next();
  }
});
```

### Sequelize Validation

```javascript
const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
      notNull: { msg: "Email cannot be null" },
    },
  },
  age: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 150,
    },
  },
});
```

---

## Middleware/Hooks

### Mongoose Middleware

```javascript
// Pre-save middleware (before saving)
userSchema.pre("save", async function (next) {
  // Hash password before saving
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Post-save middleware (after saving)
userSchema.post("save", function (doc) {
  console.log("User saved:", doc._id);
});
```

### Sequelize Hooks

```javascript
User.beforeCreate(async (user) => {
  // Hash password before creating
  user.password = await bcrypt.hash(user.password, 10);
});

User.afterCreate((user) => {
  console.log("User created:", user.id);
});
```

---

## Summary

✓ ORM/ODM abstracts database interactions
✓ Mongoose for MongoDB
✓ Sequelize for PostgreSQL/MySQL
✓ Define schemas with validation
✓ Handle relationships properly
✓ Use middleware for data processing

**Next: API Development →**
