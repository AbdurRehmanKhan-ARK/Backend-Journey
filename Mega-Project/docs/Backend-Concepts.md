# Backend Concepts Explained — A Reference Guide

Companion notes to `Project-Structure.md`. That file explains **what** each folder/file does structurally. This file explains **why** the concepts inside them exist — the theory behind the code, written for interview-readiness rather than just "getting it to run."

---

## 1. REST API & HTTP Fundamentals

A REST API is a set of conventions for structuring web requests around **resources** (nouns, like `user`, `video`) and **HTTP methods** (verbs, like `GET`, `POST`) that describe what to *do* with that resource.

| Method | Purpose | Example in this project |
|---|---|---|
| `GET` | Retrieve data | Fetch a user's profile |
| `POST` | Create new data | `/register`, `/login` |
| `PATCH` / `PUT` | Update existing data | Update avatar |
| `DELETE` | Remove data | Delete an account |

**HTTP status codes** aren't arbitrary — each number range has a meaning:
- `2xx` — success (`200 OK`, `201 Created`)
- `4xx` — client made a mistake (`400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `409 Conflict`)
- `5xx` — server made a mistake (`500 Internal Server Error`)

⭐ **Interview point:** using the *correct* status code (not just `200` for everything) signals you understand the protocol, not just the syntax. A login failure should be `401`, not `200` with an error message buried in the body.

---

## 2. MVC-Inspired Architecture

MVC (Model-View-Controller) is a pattern for separating concerns so a codebase stays maintainable as it grows. This project doesn't have a "View" (it's a pure API, no server-rendered pages), but the **Model** and **Controller** separation is fully applied:

- **Model** (`models/`) — defines the *shape* of data (schema only, no logic)
- **Controller** (`controllers/`) — contains the actual business logic (what happens when a request arrives)
- **Route** (`routes/`) — the thin layer that maps a URL + method to a controller function, with zero logic of its own

**Why this matters:** without this separation, a single file ends up holding routing, validation, database queries, and response formatting all tangled together. Splitting them means each piece can be found, tested, and changed independently — a bug in validation logic doesn't require touching the routing file.

---

## 3. Middleware (Express)

Middleware is a function that sits **between** an incoming request and the final response, with the power to inspect, modify, reject, or pass along the request. Every middleware function has the signature `(req, res, next)` — calling `next()` hands control to the next function in the chain; not calling it halts the request there.

This project uses middleware for:
- **`multerMiddleware.js`** — intercepts file uploads before they reach the controller
- **`authMiddleware.js`** (`verifyJWT`) — intercepts protected routes, verifies identity, attaches `req.user`
- **Error-handling middleware** — a special 4-parameter middleware (`(err, req, res, next)`) that catches thrown errors and formats them into consistent JSON responses instead of Express's default HTML error page

⭐ **Interview point:** middleware order matters. `router.route("/logout").post(verifyJWT, logoutUser)` — `verifyJWT` MUST run first, since `logoutUser` depends on `req.user` being populated by it.

---

## 4. JWT — Access Tokens & Refresh Tokens

**The problem JWTs solve:** HTTP is stateless — the server doesn't inherently remember who made the last request. Every request needs proof of identity attached to it. Re-sending a username/password on every single request would be both slow and insecure. A **JWT (JSON Web Token)** is a signed, tamper-evident string the server issues once after successful login, which the client then attaches to every future request instead of raw credentials.

A JWT has three parts (`header.payload.signature`), and its signature is what makes it trustworthy — anyone can *read* the payload (it's just base64, not encrypted), but nobody can *forge* a valid signature without the server's secret key.

### Why two tokens instead of one

| | Access Token | Refresh Token |
|---|---|---|
| Lifespan | Short (minutes–1 day) | Long (days–weeks) |
| Sent with | Every API request | Only to `/refresh-token` |
| Purpose | Prove identity per-request | Get a new access token without re-login |
| Payload | Can hold more user info | Minimal — usually just `_id` |

A single long-lived token would be convenient but dangerous (a leaked token stays valid for weeks). A single short-lived token would be secure but annoying (constant re-logins). Splitting the job gives both: minimal exposure on the token that travels constantly, and long-lived convenience on the token that rarely travels.

### Why the refresh token is *also* stored in the database

A JWT, once issued, is technically valid until it expires — the server can't "unsign" it. Storing the current refresh token on the `User` document gives the server a way to invalidate a session on demand: on logout, the stored token is cleared (`$unset`), so even if an attacker still physically has the old token, it won't match what's in the database anymore, and the `/refresh-token` endpoint will reject it.

### The full lifecycle

1. User logs in with credentials (the *only* time a raw password touches the wire)
2. Server verifies, issues both tokens, saves the refresh token to the DB, sends both back as `httpOnly` cookies
3. Every protected request → access token is verified (`jwt.verify`) → request proceeds
4. Access token expires → client calls `/refresh-token`, sending the refresh token
5. Server checks: is the refresh token valid *and* does it match the DB record? If yes, issues a fresh token pair
6. Refresh token eventually expires too → user must log in again with credentials

### Why `httpOnly` and `secure` cookie flags matter

```javascript
const options = {
  httpOnly: true, // frontend JavaScript CANNOT read this cookie — blocks XSS-based token theft
  secure: true,   // cookie is only ever sent over HTTPS, never plain HTTP
};
```

Storing tokens in `localStorage` is a common beginner mistake — any injected script (via an XSS vulnerability) can read `localStorage` directly. `httpOnly` cookies are invisible to JavaScript entirely; only the browser can send them, automatically, to the server.

---

## 5. Password Hashing (bcrypt)

Passwords are **never** stored as plain text — if the database were ever breached, every user's actual password would be exposed. Instead, a **hash** is stored: a one-way transformation of the password that can be verified but not reversed.

```javascript
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // don't re-hash on every save, only when password actually changes
  this.password = await bcrypt.hash(this.password, 10);
});
```

The `10` is the **salt round** count — how many times the hashing algorithm loops internally. Higher = slower to compute = harder to brute-force, but also slower for legitimate logins. `10` is a common production-safe default balance.

Verification works by hashing the *entered* password with the same algorithm and comparing the result to the stored hash — never by "decrypting" anything:

```javascript
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
```

⭐ **Common bug (hit in this project):** using an `async` Mongoose hook while still expecting a `next` callback. Modern Mongoose treats an `async` function's own returned Promise as the completion signal — `next` is never passed into it, so calling `next()` inside an async hook throws `TypeError: next is not a function`.

---

## 6. Mongoose Hooks (Middleware at the Schema Level)

Separate from Express middleware, Mongoose has its own middleware concept: functions that run automatically before/after certain document operations (`save`, `remove`, `find`, etc.), defined directly on the schema.

```javascript
userSchema.pre("save", async function () { /* runs before every .save() call */ });
```

This is how password hashing happens *transparently* — no controller needs to remember to call a hashing function manually; it happens automatically as part of saving any user document, which also means it's impossible to accidentally forget it in one code path but not another.

---

## 7. File Upload Flow — Multer → Local Temp → Cloudinary

Direct browser-to-cloud uploads are avoided in favor of a two-step flow:

```
Browser → Multer (temp save on our server) → Cloudinary (permanent storage) → temp file deleted
```

**Why not upload directly from the browser to Cloudinary?**
1. **Security** — cloud storage API keys must stay server-side; exposing them to frontend JS means anyone could abuse the account via DevTools
2. **Validation control** — the server can inspect/reject a bad file *before* it reaches (and wastes quota on) the cloud
3. **Business logic sequencing** — e.g., checking for a duplicate user *before* uploading avoids wasting an upload on a request that's going to fail anyway
4. **Atomicity** — if the database write fails after upload, the server can respond with a clean error immediately, rather than leaving an orphaned file in the cloud with no matching database record

---

## 8. Environment Variables (`.env` + `dotenv`)

Secrets (API keys, database URIs, JWT signing secrets) are never hardcoded into source files — they live in a `.env` file, excluded from git via `.gitignore`, and loaded into `process.env` at runtime via the `dotenv` package.

⭐ **Common bug (hit in this project):** ES Module `import` statements are *hoisted* — they all resolve before any regular code runs, regardless of where they're physically written in the file. If `dotenv.config()` is called *after* other imports that themselves import a module which reads `process.env` at the top level (like a Cloudinary config file), those variables will be `undefined` at the moment they're read — even though `dotenv.config()` technically runs "later" in the same file. The reliable fix is a side-effect import as the very first line: `import "dotenv/config";` — this guarantees env variables are loaded before anything else executes.

---

## 9. Custom Error Handling Pattern (`ApiError`, `ApiResponse`, `asyncHandler`)

Rather than scattering inconsistent `try/catch` blocks and ad-hoc error responses across every controller, this project standardizes both success and failure shapes:

```javascript
// Every successful response has this shape:
{ statusCode, message, data }

// Every error response has this shape:
{ statusCode, message, data: null, success: false, errors: [] }
```

**`asyncHandler`** wraps every controller so a thrown error (or rejected Promise) inside an `async` function is automatically forwarded to Express's error-handling middleware, instead of crashing the process or requiring a manual `try/catch` in every single controller:

```javascript
const asyncHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch(next);
};
```

This is a widely-used production pattern — the same shape frontend developers can rely on regardless of which controller responded, and error-handling logic is written once instead of duplicated everywhere.

---

## 10. CORS (Cross-Origin Resource Sharing)

By default, browsers block a frontend running on one origin (e.g. `localhost:3000`) from making requests to a backend on a different origin (e.g. `localhost:8000`) — a security measure against malicious cross-site requests. The `cors` middleware explicitly tells the browser which origins are allowed to talk to this API:

```javascript
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
```

`credentials: true` is required specifically because this project relies on cookies for auth — without it, the browser won't send/accept cookies on cross-origin requests even if the origin itself is allowed.

---

## Quick Reference Table

| Concept | Solves | Package/Tool |
|---|---|---|
| JWT (Access/Refresh) | Stateless identity across requests | `jsonwebtoken` |
| bcrypt | Storing passwords safely | `bcrypt` |
| Mongoose pre-hooks | Automatic, unforgettable side-effects on save | Mongoose (built-in) |
| Multer | Handling multipart file uploads | `multer` |
| Cloudinary | Permanent, scalable file storage | `cloudinary` |
| dotenv | Keeping secrets out of source code | `dotenv` |
| asyncHandler | Avoiding repeated try/catch boilerplate | Custom utility |
| CORS | Controlling cross-origin browser access | `cors` |