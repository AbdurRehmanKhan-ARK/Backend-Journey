# Useful Libraries & Packages

## Core Backend Libraries

### Server & Framework

```bash
npm install express cors helmet dotenv
```

| Package | Purpose               | Link                               |
| ------- | --------------------- | ---------------------------------- |
| express | Web framework         | https://expressjs.com              |
| cors    | Cross-origin requests | https://github.com/expressjs/cors  |
| helmet  | Security headers      | https://helmetjs.github.io         |
| dotenv  | Environment variables | https://github.com/motdotla/dotenv |

---

## Database Libraries

### MongoDB

```bash
npm install mongoose mongodb
```

| Package  | Purpose        |
| -------- | -------------- |
| mongoose | MongoDB ODM    |
| mongodb  | MongoDB driver |

### PostgreSQL

```bash
npm install sequelize pg pg-hstore
```

| Package   | Purpose               |
| --------- | --------------------- |
| sequelize | SQL ORM               |
| pg        | PostgreSQL driver     |
| pg-hstore | PostgreSQL data types |

---

## Authentication & Security

```bash
npm install jsonwebtoken bcryptjs passport
```

| Package         | Purpose                   |
| --------------- | ------------------------- |
| jsonwebtoken    | JWT tokens                |
| bcryptjs        | Password hashing          |
| passport        | Authentication middleware |
| express-session | Session management        |

---

## Validation & Error Handling

```bash
npm install joi express-validator yup
```

| Package           | Purpose            |
| ----------------- | ------------------ |
| joi               | Schema validation  |
| express-validator | Request validation |
| yup               | Data validation    |

---

## Middleware & Utilities

```bash
npm install morgan express-rate-limit compression
```

| Package            | Purpose              |
| ------------------ | -------------------- |
| morgan             | HTTP request logging |
| express-rate-limit | Rate limiting        |
| compression        | Gzip compression     |
| multer             | File upload handling |

---

## Development Tools

```bash
npm install -D nodemon eslint prettier jest supertest
```

| Package   | Purpose                |
| --------- | ---------------------- |
| nodemon   | Auto-reload on changes |
| eslint    | Code linting           |
| prettier  | Code formatting        |
| jest      | Testing framework      |
| supertest | HTTP assertion library |

---

## HTTP & API Clients

```bash
npm install axios node-fetch
```

| Package    | Purpose               |
| ---------- | --------------------- |
| axios      | HTTP client           |
| node-fetch | Fetch API for Node.js |

---

## Utilities

```bash
npm install lodash moment uuid
```

| Package | Purpose                |
| ------- | ---------------------- |
| lodash  | Utility functions      |
| moment  | Date/time manipulation |
| uuid    | Generate unique IDs    |
| dotenv  | Environment variables  |

---

## Installation Commands (All Together)

### Production Dependencies

```bash
npm install express cors helmet dotenv mongoose mongodb sequelize pg pg-hstore jsonwebtoken bcryptjs joi express-validator morgan express-rate-limit compression
```

### Development Dependencies

```bash
npm install -D nodemon eslint prettier jest supertest
```

---

## Quick Setup Script

Create `package.json` with:

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.0.0",
    "mongoose": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0"
  }
}
```

Then run: `npm install`

---

Last Updated: 2026-07-07
