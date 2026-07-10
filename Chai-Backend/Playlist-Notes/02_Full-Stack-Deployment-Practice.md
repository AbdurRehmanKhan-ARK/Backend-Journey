# 🌐 03 — Full-Stack Deployment: CORS, Vite, Proxy & Best Practices
> 📅 09 July 2026

---

## What is Vite?

Vite is a modern frontend build tool that provides a fast development experience for web applications. It leverages **native ES modules** in the browser and uses **Rollup** for production builds — allowing faster hot module replacement (HMR) and optimized builds.

---

## What is CORS?

**CORS** = Cross-Origin Resource Sharing.

A security feature implemented by web browsers that restricts web pages from making requests to a **different domain or port** than the one that served the page. This is known as the **Same-Origin Policy.**

```
Frontend: localhost:5173
Backend:  localhost:3000

❌ Browser blocks this request — different ports = different origins
```

---

## Solution to CORS — Proxy Server

A **proxy server** acts as an intermediary between the client (frontend) and the server (backend), forwarding requests so the browser never sees a cross-origin request.

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
      // frontend hits /api/jokes
      // Vite forwards it to http://localhost:3000/api/jokes
      // browser never sees the cross-origin request — no CORS issue
    }
  }
}
```

> 💡 This proxy only works in **development**. In production, frontend and backend run on the same port — proxy is completely ignored.

---

## Full-Stack Deployment — Bad Practice vs Good Practice

### The Core Problem

| Environment | Frontend | Backend |
|-------------|----------|---------|
| Development | `localhost:5173` | `localhost:3000` |
| Production | ❌ should not be separate | ❌ expensive and complex |

---

### ❌ Bad Practice — Pushing Raw Folders

Many developers push the entire frontend folder directly to deployment.

**Why this is bad:**

- `node_modules/` — hundreds of thousands of files, heavy dev dependencies not needed in production
- `src/` — raw React/JSX code that browsers **cannot understand or execute**
- `vite.config.js` — build config is completely useless after deployment
- **Double cost** — two separate cloud servers = higher hosting bills

---

### ✅ Good Practice — Build First, Then Deploy

```bash
npm run build
```

This command strips away React, JSX, and dev dependencies — optimizing everything into a single light production folder called `dist/`:

```
dist/
├── index.html              # the only HTML file
└── assets/
    ├── index-xyz123.js     # all React logic minified into one file
    └── index-xyz123.css    # all styles compressed into one file
```

---

## Serving `dist/` via Express — Single Server Setup

```javascript
import express from 'express'
import path from 'path'

const app = express()

// 1. API routes FIRST — Express intercepts these before static files
app.get('/api/jokes', (req, res) => {
  res.json({ joke: "Why do programmers prefer dark mode?" })
})

// 2. Serve static files from dist/
app.use(express.static(path.resolve('../frontend/dist')))

// 3. Catch-all — send index.html for any unknown route (React Router handles it)
app.get('*', (req, res) => {
  res.sendFile(path.resolve('../frontend/dist/index.html'))
})

app.listen(3000)
```

### How single server routes traffic:

```
yoursite.com            →  Express serves dist/index.html  (React loads)
yoursite.com/about      →  Express serves dist/index.html  (React Router renders /about)
yoursite.com/api/jokes  →  Express intercepts → runs API route → returns JSON
```

---

## Why `path.resolve()` — not a plain string?

```javascript
// ❌ relative path — depends on WHERE you run the command from
express.static('../frontend/dist')

// ✅ absolute path — always works regardless of where server is started from
express.static(path.resolve('../frontend/dist'))
```

> Always use `path.resolve()` for file paths in Express.

---

## Why `app.get('*')` — the catch-all route?

React is a **Single Page Application (SPA)** — there is only **one actual HTML file**: `dist/index.html`. React Router handles `/about`, `/profile` etc. on the client side.

```
Without app.get('*'):
User visits yoursite.com/about directly
→ Express looks for a file called "about"
→ File doesn't exist → 404 Not Found ❌

With app.get('*'):
User visits yoursite.com/about directly
→ Express serves index.html
→ React Router renders the /about component ✅
```

> ⚠️ The catch-all route must always be **last** — after API routes and static files. Otherwise it will intercept API calls too.

---

## Summary

| Metric | Bad Practice | Good Practice |
|--------|-------------|---------------|
| Servers | 2 separate production servers | 1 single unified server |
| Code pushed | Raw `src/`, `node_modules/` | Optimized `dist/` only |
| Performance | Slow, uncompressed | Highly optimized, fast |
| Hosting cost | High (two environments) | Low (one environment) |
| CORS in prod | Complex configuration needed | Not needed — same origin |

---
