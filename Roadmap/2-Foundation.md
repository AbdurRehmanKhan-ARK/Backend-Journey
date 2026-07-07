# Foundation Concepts

## Backend Fundamentals

### HTTP Protocol Basics

HTTP (HyperText Transfer Protocol) is the foundation of web communication.

#### HTTP Methods

| Method | Purpose                | Example                                  |
| ------ | ---------------------- | ---------------------------------------- |
| GET    | Retrieve data          | `GET /users` - Get all users             |
| POST   | Create new data        | `POST /users` - Create new user          |
| PUT    | Update entire resource | `PUT /users/1` - Update user with id 1   |
| PATCH  | Partial update         | `PATCH /users/1` - Partially update user |
| DELETE | Remove data            | `DELETE /users/1` - Delete user          |

#### HTTP Status Codes

- **2xx** - Success (200 OK, 201 Created, 204 No Content)
- **3xx** - Redirection (301 Moved, 302 Found)
- **4xx** - Client Error (400 Bad Request, 401 Unauthorized, 404 Not Found)
- **5xx** - Server Error (500 Internal Server Error, 502 Bad Gateway)

---

## REST API Principles

REST (Representational State Transfer) is an architectural style for designing APIs.

### REST Principles

1. **Client-Server Architecture** - Separation of concerns
2. **Statelessness** - Each request contains all needed information
3. **Cacheable** - Responses should define themselves as cacheable
4. **Uniform Interface** - Consistent API design
5. **Layered System** - Multiple layers for scalability
6. **Code on Demand** (Optional) - Server can extend client functionality

### RESTful URL Structure

```
/api/v1/resource
/api/v1/users           - GET (list) | POST (create)
/api/v1/users/:id       - GET (read) | PUT (update) | DELETE (delete)
/api/v1/users/:id/posts - GET (related resource)
```

---

## Request and Response Cycle

```
1. Client creates HTTP Request
   ├─ URL/Endpoint
   ├─ Method (GET, POST, etc)
   ├─ Headers (authorization, content-type)
   └─ Body (for POST/PUT)

2. Request travels to Server

3. Server processes request
   ├─ Routes to handler
   ├─ Validates data
   ├─ Accesses database
   └─ Executes business logic

4. Server creates HTTP Response
   ├─ Status code
   ├─ Headers
   └─ Body (JSON data)

5. Response sent to Client

6. Client receives and processes response
```

---

## Client-Server Model

### Traditional Architecture

```
Frontend                     Backend
─────────                    ───────
┌──────────┐               ┌──────────────┐
│  React   │               │  Express.js  │
│  Vue     │◄──HTTP───────►│  Framework   │
│  Angular │               │              │
└──────────┘               └──────────────┘
                                  │
                           ┌──────▼────────┐
                           │   Database    │
                           │  (MongoDB,    │
                           │ PostgreSQL)   │
                           └───────────────┘
```

### Key Points

- Frontend handles UI/UX
- Backend handles business logic and data
- Communication via HTTP
- Backend is stateless (each request is independent)

---

## API Documentation

Good API documentation is crucial for:

- Frontend developers to understand endpoints
- API consumers
- Team collaboration
- Maintenance

### Example API Documentation

```
Endpoint: GET /api/v1/users/:id

Description: Retrieve user by ID

Parameters:
- id (path): User ID (number, required)

Response (200 OK):
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}

Error (404 Not Found):
{
  "success": false,
  "error": "User not found"
}
```

---

## Database Role in Backend

Databases store and retrieve application data:

**SQL Databases (Structured)**

- Fixed schema
- ACID compliance
- Good for structured data
- Examples: PostgreSQL, MySQL

**NoSQL Databases (Flexible)**

- Flexible schema
- High scalability
- Good for unstructured data
- Examples: MongoDB

---

## Summary

✓ HTTP is the protocol for web communication
✓ REST is an architectural style for APIs
✓ Backend processes requests and manages data
✓ Databases store application data
✓ Frontend and backend communicate via APIs

**Next: Learn Express.js Basics →**
