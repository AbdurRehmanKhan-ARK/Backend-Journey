# Project Structure - Professional Backend Setup

Notes from video, titled => *"How to setup a professional backend project"*

---

## Folder Structure

```
Mega-Project/
├── node_modules/          # dependencies (git-ignored)
├── public/                # static assets served directly (e.g. temp file uploads before Cloudinary)
├── src/
│   ├── controllers/       # business logic - what happens when a route is hit
│   ├── db/                # database connection setup (mongoose.connect, etc.)
│   ├── middlewares/       # auth checks, error handling, multer, etc. - functions that run between request and controller
│   ├── models/            # mongoose schemas (User, Video, Comment, etc.)
│   ├── routes/            # route definitions - maps URL + method → controller
│   ├── utils/             # reusable helper functions (custom error class, async handler, cloudinary upload, etc.)
│   ├── app.js             # express app config - middlewares, routes mounted here
│   ├── constants.js       # app-wide constant values (DB name, cookie options, enums)
│   └── index.js           # entry point - loads env, connects DB, starts server
├── .env                   # environment variables (git-ignored, never committed)
├── .gitignore
├── .prettierrc             # prettier formatting rules (consistent code style across team)
├── .prettierignore         # files prettier should skip (e.g. node_modules, dist)
├── package.json
├── package-lock.json
└── README.md
```

---

## Why Split Like This? (MVC-inspired separation)

- **`routes/`** only defines *which* URL triggers *which* function - no logic here
- **`controllers/`** hold the actual logic - what to do when a request comes in
- **`models/`** define data shape - schema only, no business logic
- **`middlewares/`** sit between the incoming request and the controller - used for things that apply across multiple routes (auth check, file upload handling, error formatting)
- **`utils/`** - small reusable pieces that don't belong to any one feature (e.g. a wrapper to avoid repeating try/catch in every controller)
- **`db/`** - database connection logic. ⭐ Remember: *"Database is in another continent"* - network calls to it can fail or take time, so **always use try-catch + async** when writing DB-connection code.

⭐ **Interview point:** this separation is what makes a codebase scalable - each piece has one job, easy to find, easy to test independently.

---

## Key Files

### `constants.js`

Holds fixed values used across the app - e.g. database name, cookie options, allowed roles. Keeping them in one file avoids magic strings scattered everywhere and makes changes easy (change once, applies everywhere).

```javascript
export const DB_NAME = "MegaProject"
```

### `db/index.js` - DB Connection Logic

```javascript
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Database connected ! DB Host : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Error in database connection : ", error);
        process.exit(1); // exit with failure
    }
}

export default connectDB
```

⚠️ **Common mistakes to avoid here** (learned the hard way):
- The connection string template literal needs `${}` around the env variable - `` `process.env.MONGODB_URI/${DB_NAME}` `` is a broken string (it's literally the text "process.env.MONGODB_URI"), not an interpolated one. Must be `` `${process.env.MONGODB_URI}/${DB_NAME}` ``.
- `connectionInstance` itself is a huge object - log `connectionInstance.connection.host` for a clean, readable output instead of the whole thing.
- This file only *defines* `connectDB` - it still needs to be **called** from `index.js`. Defining and exporting a function does nothing on its own.

### `app.js` vs `index.js`

- `app.js` - configures the Express app itself: `express.json()`, `cors()`, route mounting, etc. Exports the configured `app`.
- `index.js` - the actual entry point. Loads `.env` config, connects to the database, and only *then* starts the server (`app.listen()`). Keeping DB connection separate from app config means the app doesn't start serving requests before the DB is ready.

```javascript
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env"
})

connectDB();
```

⚠️ **Common mistake:** importing `connectDB` is not the same as calling it - forgetting `connectDB()` at the bottom means the file runs top-to-bottom and exits immediately (nodemon shows *"clean exit - waiting for changes"* with no crash, because there's nothing left to do).

### `.prettierrc` and `.prettierignore`

- `.prettierrc` - defines formatting rules (semi-colons, quote style, tab width) so code style stays consistent regardless of who writes it
- `.prettierignore` - tells Prettier which files/folders to skip formatting (`node_modules`, `dist`, `package-lock.json`) - same idea as `.gitignore` but for the formatter

---

## `.env` - What Goes Here

Environment-specific secrets and config that should **never** be committed to git:

```
PORT=8000
MONGODB_URI=mongodb://localhost:27017
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=...
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=...
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

⚠️ If `.env` was ever accidentally committed before `.gitignore` was set up correctly, the values inside it should be treated as compromised - rotate/regenerate secrets (new JWT secret, new DB password) even after removing the file from tracking, since old commits may still contain them in git history.

### Loading `.env` - pick ONE method, not both

Two ways to load env variables, and mixing both causes confusing "injected env (0)" messages:

1. **Script-based:** `"dev": "nodemon -r dotenv/config src/index.js"` in `package.json` - dotenv auto-loads `.env` before the app starts.
2. **Manual (recommended for more control):** `dotenv.config({ path: "./.env" })` inside `index.js` itself.

Pick one. If using the manual method, keep the `package.json` script clean:
```json
"scripts": {
    "dev": "nodemon --experimental-json-modules src/index.js"
}
```

---

## Local MongoDB vs Atlas

The video uses **MongoDB Atlas** (cloud). Using a **local MongoDB install** instead works identically - same Mongoose code, same concepts - just skip the signup/cluster/IP-whitelist steps.

```
# Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net

# Local
MONGODB_URI=mongodb://localhost:27017
```

**MongoDB Compass** (GUI tool) connects to `localhost:27017` and gives the same visual experience as the Atlas web UI - browse databases, collections, and documents.

⭐ **Key thing to understand:** a database (and its collections) don't need to be created manually beforehand. MongoDB creates them **automatically** the first time a document is actually inserted through the app. Seeing no database yet in Compass after just wiring up the connection is expected - it only appears once real data (e.g. from a signup API call) gets saved.

---

## Setup Sequence (Order This Was Built In)

1. `npm init` → `package.json`
2. Install core deps: `express`, `mongoose`, `dotenv`, `cors`, `cookie-parser`
3. Set up `.gitignore` **first**, before anything else gets created (lesson learned - avoids committing `node_modules`/`.env` by mistake)
4. Create `src/` folder structure (empty folders as placeholders)
5. `constants.js` → fixed values
6. `db/` → connection logic
7. `app.js` → express config
8. `index.js` → entry point, ties `db` connection + `app.listen()` together - **actually call `connectDB()`**, don't just import it
9. `.prettierrc` + `.prettierignore` → consistent formatting from day one

---

## Debugging Checklist (real issues hit while setting this up)

| Symptom | Cause |
|---|---|
| `ERR_MODULE_NOT_FOUND` on `constants.js` | Wrong relative import path - `db/index.js` needs `../constants.js`, not `./constants.js`, since `constants.js` lives one level up in `src/` |
| `[nodemon] clean exit - waiting for changes` (no error) | `connectDB()` was imported but never called |
| `injected env (0) from .env` | Either wrong `.env` filename in `dotenv.config({ path })`, or dotenv being loaded twice (once via `-r dotenv/config` in the script, once manually) - pick one method |
| Connects to `localhost` even with a broken connection string | Malformed template literal (missing `${}`) silently fell back to a default - always verify with `console.log(process.env.MONGODB_URI)` before trusting a successful connection |