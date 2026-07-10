# 🗄️ 04 — Data Modelling for Backend with Mongoose

> 📅 09 July 2026

---

## The Right Mindset Before Writing a Single Line

```
Junior dev:   client says "build signup" → immediately starts coding username + password
Senior dev:   asks "what OTHER data do you need?" → models everything first → then codes
```

> 💡 Always extract **all** fields required for each entity before writing any code. Changing schema later = DB migration = chaos.

---

## What is Mongoose?

Mongoose is an **ODM (Object Data Modeling)** library for MongoDB and Node.js. It provides a schema-based solution to model application data — enforcing structure, validation, and types on top of MongoDB's flexible documents.

---

## Database Modeling Tools

**Moon Modeler** — visual ER diagram tool for MongoDB/NoSQL (paid)

**Eraser** — free alternative, same concept — design schema visually before coding

> Design your schema visually first — saves hours of refactoring later.

---

## Naming Conventions — Industry Standard

```
✅ userModel.js       ← model file for user entity
✅ userController.js  ← controller file for user logic

❌ user.js            ← ambiguous — is it a model? controller? utility?
❌ userSchema.js      ← not standard
❌ userEntity.js      ← not standard
```

> File naming is not optional — it is communication with your team.

---

## Project Structure for TODO App

```
backend/
└── models/
    └── todos/
        ├── userModel.js        # user schema
        ├── todosModel.js       # todo schema
        └── sub-todosModel.js   # sub-todo schema
```

---

## userModel.js

```javascript
import mongoose from "mongoose";

// ❌ Basic way — no mongoose superpowers
// const userSchema = new mongoose.Schema({
//   username: String,
//   email: String,
//   isActive: Boolean,
// })

// ✅ Correct way — with full validation
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true, // field must be filled
      unique: true, // no two users can have same username
      lowercase: true, // automatically converts to lowercase before saving
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
    isActive: {
      type: Boolean,
      default: false, // new users inactive by default
    },
  },
  { timestamps: true }, // auto adds createdAt and updatedAt fields
);

export const User = mongoose.model("User", userSchema);
// ⭐ Interview point: mongoose automatically pluralizes and lowercases the model name
// "User" → stored in MongoDB as "users" collection
```

---

## todosModel.js

```javascript
import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    complete: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // stores reference to a User document
      ref: "User", // tells mongoose which model to populate from
    },
    subTodos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubTodo", // array of references to SubTodo documents
      },
    ],
  },
  { timestamps: true },
);

export const Todo = mongoose.model("Todo", todoSchema);
```

---

## sub-todosModel.js

```javascript
import mongoose from "mongoose";

const subTodoSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    complete: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const SubTodo = mongoose.model("SubTodo", subTodoSchema);
```

---

## Key Concepts — ObjectId & ref

```javascript
createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}
```

- `ObjectId` — MongoDB's unique ID type for every document
- `ref: "User"` — tells Mongoose "this ID belongs to the User model"
- Later you can use `.populate('createdBy')` to automatically replace the ID with the full user object

```javascript
// without populate
todo.createdBy  →  "64abc123def456"  (just an ID)

// with populate
todo.createdBy  →  { username: "abdur", email: "...", isActive: true }
```

---

## ✅ Key Takeaways

- Design schema **before** writing any backend code — DB migrations are painful
- Use mongoose field options: `required`, `unique`, `lowercase`, `default`
- `timestamps: true` — always add this, you will always need `createdAt`/`updatedAt`
- `mongoose.model("User", schema)` → MongoDB collection becomes `"users"` automatically
- `ObjectId` + `ref` = relationships between collections in MongoDB
- File naming: `userModel.js`, `userController.js` — always follow this convention

---
