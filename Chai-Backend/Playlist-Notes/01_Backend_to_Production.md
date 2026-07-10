## What is vite
- Vite is a modern frontend build tool that provides a fast development experience for web applications. It leverages native ES modules in the browser and uses Rollup for production builds, allowing for faster hot module replacement (HMR) and optimized builds. 

## What is CORS
- CORS stands for Cross-Origin Resource Sharing. It is a security feature implemented by web browsers to restrict web pages from making requests to a different domain than the one that served the web page. This is known as the Same-Origin Policy.

# Solution to CORS
- To enable communication between the frontend and backend, you can use a*proxy server*_. A proxy server acts as an intermediary between the client (frontend) and the server (backend), allowing requests to be made to the backend without triggering CORS issues. For example: http://localhost:3000 as a proxy will 

## Proxy and CORS
- When the frontend and backend are on different domains or ports, browsers enforce the Same-Origin Policy, which can lead to CORS (Cross-Origin Resource Sharing) issues. To avoid this, you can set up a proxy in your frontend development servers.

## Why `path.resolve()` instead of a plain string?

`express.static('../frontend/dist')` — plain string path is relative
to where you RUN the command from, not where the file is.

`path.resolve('../frontend/dist')` — always gives absolute path,
works no matter where you run the server from.

✅ Always use `path.resolve()` for file paths in Express.

## `app.get('*')` — Why the catch-all route?

React is a Single Page Application (SPA).
There is only ONE actual HTML file — `dist/index.html`.
React Router handles `/about`, `/profile` etc. on the client side.

Without `app.get('*')`:
- User goes to `yoursite.com/about` directly → Express looks for
  a file called `about` → 404 Not Found

With `app.get('*')`:
- Any unknown route → Express serves `index.html`
- React Router takes over and renders the right component
  