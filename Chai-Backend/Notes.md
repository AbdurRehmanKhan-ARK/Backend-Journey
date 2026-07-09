## What is vite
- Vite is a modern frontend build tool that provides a fast development experience for web applications. It leverages native ES modules in the browser and uses Rollup for production builds, allowing for faster hot module replacement (HMR) and optimized builds. 

## What is CORS
- CORS stands for Cross-Origin Resource Sharing. It is a security feature implemented by web browsers to restrict web pages from making requests to a different domain than the one that served the web page. This is known as the Same-Origin Policy.

# Solution to CORS
- To enable communication between the frontend and backend, you can use a*proxy server*_. A proxy server acts as an intermediary between the client (frontend) and the server (backend), allowing requests to be made to the backend without triggering CORS issues. For example: http://localhost:3000 as a proxy will 

## Proxy and CORS
- When the frontend and backend are on different domains or ports, browsers enforce the Same-Origin Policy, which can lead to CORS (Cross-Origin Resource Sharing) issues. To avoid this, you can set up a proxy in your frontend development servers.

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

## 6. Summary Comparison

| Metric | Bad Practice | Good Practice (Hitesh's Approach) |
| :--- | :--- | :--- |
| **Servers** | 2 separate production servers | 1 single unified server |
| **Code Pushed** | Raw `src/`, `node_modules/` | Optimized, minified `dist/` folder |
| **Performance** | Slow, uncompressed files | Highly optimized, fast loading |
| **Hosting Cost** | High (paying for two environments) | Low (paying for one environment) |
