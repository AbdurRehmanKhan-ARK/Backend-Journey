


# Full-Stack Deployment: Bad Practice vs. Best Practice

## 1. The Core Problem (Development vs. Production)
In **development**, you run two separate servers for convenience:
* **Frontend (React/Vite):** Runs on `localhost:5173` (hot-reloading, dev tools).
* **Backend (Node/Express):** Runs on `localhost:3000` (handles database and API endpoints).

In **production**, keeping two separate servers running is expensive, hard to manage, and unnecessary. 

---

## 2. The Bad Practice: Pushing Raw Folders
Many developers deploy by pushing the entire frontend repository (including raw folders) directly into the backend deployment environment.

### Why this is bad:
* **`node_modules/`:** Contains hundreds of thousands of heavy development dependencies not needed in production.
* **`src/` folder:** Contains raw React components and JSX code that web browsers cannot understand or execute directly.
* **`vite.config.js`:** Build configurations are completely useless once the site is deployed.
* **Double Costs:** Running two separate cloud servers increases hosting bills and setup complexity.

---

## 3. The Good Practice: Building & Bundling
Instead of deploying raw code, you compile your frontend first using the build command.

```bash
npm run build
```

### What this command does:
It strips away React, JSX, and dev dependencies, optimizing your entire application into a single, light production folder called `dist/`.

```text
dist/
├── index.html            # The only HTML file
└── assets/
    ├── index-xyz123.js   # All React logic minified into one file
    └── index-xyz123.css  # All styles compressed into one file
```

---

## 4. Serving the `dist/` Folder via Express
Once you have the optimized `dist/` folder, you configure your Express backend to serve these static files. This merges both the frontend and backend onto a **single port (e.g., 3000)**.

```javascript
import express from 'express'
import path from 'path'
const app = express()

// 1. Handle API requests first
app.get('/api/jokes', (req, res) => {
    res.json({ joke: "Why do programmers prefer dark mode?" })
})

// 2. Serve production-ready static files from the dist folder
app.use(express.static(path.resolve('../frontend/dist')))

// 3. Catch-all: Route any other request (like /about, /profile) to the React index.html
app.get('*', (req, res) => {
    res.sendFile(path.resolve('../frontend/dist/index.html'))
})

app.listen(3000)
```

### How the Single Server Routes traffic:
* `://yoursite.com` → Express serves `dist/index.html` (Frontend loads).
* `://yoursite.comabout` → Express serves `dist/index.html` (React Router takes over).
* `://yoursite.comapi/jokes` → Express intercepts this and executes the API backend route.

---

## 5. The Role of Proxies (Dev vs. Prod)
Because the frontend and backend live on the same port in production, you do not need complex URL configurations. However, they live on different ports during development. 

To bridge this gap during development, you use a **Proxy** in your Vite configuration:

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3000' // Forwards frontend API calls to backend port
    }
  }
}
```

* **In Development:** When React fetches `/api/jokes`, Vite catches it and forwards it safely to `http://localhost:3000/api/jokes` to avoid CORS issues.
* **In Production:** The proxy configuration is completely ignored because everything natively runs on port 3000 anyway.

---

## 6. Summary Comparison Till Third Video

| Metric | Bad Practice | Good Practice (Hitesh's Approach) |
| :--- | :--- | :--- |
| **Servers** | 2 separate production servers | 1 single unified server |
| **Code Pushed** | Raw `src/`, `node_modules/` | Optimized, minified `dist/` folder |
| **Performance** | Slow, uncompressed files | Highly optimized, fast loading |
| **Hosting Cost** | High (paying for two environments) | Low (paying for one environment) |


## Resuming From Fourth Video

# Data Modelling for Backend with Mongoose

- Client says: " build me signup and signin pages"
- Unexperienced: " starts building the pages on just username, and password "
- Experienced: " asks client what other data they want to store, and then builds the backend"
  
> What is Mongoose?
- Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a straightforward, schema-based solution to model your application data. Mongoose allows you to define schemas for your data, enforce validation, and interact with MongoDB in an organized manner.

> Use Moon Modeler - But what is Moon Modeler?
- Moon Modeler is a visual database modeling tool that allows you to design and visualize your database schema. It supports various databases, including MongoDB and noSQL, and helps in creating ER diagrams, generating code, and managing database structures effectively. (BUT it is paid.. sed loif - but you can use Eraser which also a visual databse modeling tool)

# Key Point to Note:
- The best practice is always to first extract all the , i repeat, all the fields required for each entitiy in your database modeling so that afterwards there's no such backend chaos like DB-Migration etc , for example Registration Form must have 
- An experienced and a well-mannered developer always names their files by standard, for suppos if there's a file responsible for data modeling of user entity then they name it "userModel.js" and not "user.js" or "userSchema.js" or "userEntity.js" etc, similarly for a Controller file they would name it " userController.js" and not "user.js".
  
## Making Models for TODO List:
- Directory: 
  ```text
  backend/models/todos/
  ```
  sub-todosModel.js
  todosModel.js
  userModel.js

- Lets write code for userModel.js
  ```javascript
  import mongoose from "mongoose"
  // const userSchema = new mongoose.Schema(
  // {
  //      username: String, // this is local practiced coding and not using mongoose superpower
  //      email: String,
  //      isActive: Boolean,
  // }) // takes an object as parameter which will be having the data of schema, can also take a secondary object for timestamps like createdAt and updatedAt
  
  const userSchema = new mongoose.Schema(
    {
      // lets use mongoose superpower
      username: {
        type: String, // datatype
        required: true, // this field must be filled
        unique: true, // username is always unique for major sites
        lowercase: true, // all usernames must be lowercased
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
        default: false,
      }
    },{timestamps: true})
  export const User = mongoose.model("User",userSchema) // takes two parameters: 1.What is the name of the model 2.on which bases (schema) am i creating it
  // why creating const User? => To create a reusable model for interacting with the User collection in MongoDB
  // and the name provided 'User' will be converted to plural and lowercase in mongoDB because mongoose automatically pluralizes model names to match the collection name in the database. [interview regarding point]
  ```

  
- Lets write code for todosModel.js
  ```javascript
  import mongoose from "mongoose"

  const todoSchema = new mongoose.Schema({
    content: {
      type: String,
      required: true,
    },
    complete: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    subTodos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubTodo"
      }
    ] // array of subtodos
  },{timestamps: true})

  export const Todo = mongoose.model("Todo",todoSchema)
  ```

  
- Lets write code for sub-todosModel.js
  ```javascript
  import mongoose from "mongoose"

  const subTodoSchema = new mongoose.Schema({
    content: {
      type: String,
      required: true
    },
    complete: {
      type: Boolean,
      default: false
    },
    createdBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },{timestamps: true})

  export const SubTodo = mongoose.model("SubTodo",subTodoSchema) 