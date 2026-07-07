# Hands-On Projects - Progressive Learning

Build these projects to master backend development. Start with beginner projects and progressively move to advanced ones.

---

## 🟢 Beginner Projects

### Project 1: Todo API

**Level:** Beginner (Week 1-2)

**Objective:** Learn basic CRUD operations and REST principles.

**Features:**

- ✅ Create new todos
- ✅ Read all todos / single todo
- ✅ Update todo (title, description, status)
- ✅ Delete todo
- ✅ Mark todo as complete
- ✅ List todos with filtering (completed/pending)

**Tech Stack:**

- Express.js
- MongoDB + Mongoose OR SQLite + Sequelize
- Postman for testing

**Learning Points:**

- HTTP methods (GET, POST, PUT, DELETE)
- Route parameters and query parameters
- Request body handling
- Basic validation
- Error handling

**Endpoints:**

```
GET    /api/todos              - Get all todos
POST   /api/todos              - Create new todo
GET    /api/todos/:id          - Get single todo
PUT    /api/todos/:id          - Update todo
DELETE /api/todos/:id          - Delete todo
```

**Estimated Time:** 10 hours

---

### Project 2: Blog API

**Level:** Beginner (Week 3-4)

**Objective:** Learn relationships between data models.

**Features:**

- ✅ Create, read, update, delete blog posts
- ✅ Add comments to posts
- ✅ List all posts with pagination
- ✅ Search posts by title/content
- ✅ Author information with each post

**Tech Stack:**

- Express.js
- MongoDB + Mongoose
- Postman or Insomnia

**Learning Points:**

- One-to-Many relationships (Author → Posts)
- Nested data structures
- Pagination
- Search/filtering
- Data validation

**Database Schema:**

```
Post {
  _id
  title
  content
  author (reference to User)
  comments []
  createdAt
  updatedAt
}

Comment {
  _id
  text
  author
  postId
  createdAt
}
```

**Estimated Time:** 12 hours

---

## 🟡 Intermediate Projects

### Project 3: Social Media API (Twitter Clone)

**Level:** Intermediate (Week 5-8)

**Objective:** Learn authentication and complex relationships.

**Features:**

- ✅ User registration & login (JWT)
- ✅ Create, read, update, delete tweets
- ✅ Like/unlike tweets
- ✅ Retweet functionality
- ✅ Follow/unfollow users
- ✅ User profile management
- ✅ User feed (tweets from followed users)
- ✅ Search users/tweets
- ✅ Notifications (optional)

**Tech Stack:**

- Express.js
- MongoDB + Mongoose
- JWT for authentication
- Postman for testing

**Learning Points:**

- User authentication with JWT
- Many-to-Many relationships (Users ↔ Followers)
- Authorization middleware
- Pagination and sorting
- Complex queries
- Rate limiting

**Database Schema:**

```
User {
  _id
  username
  email
  password (hashed)
  bio
  avatar
  followers []
  following []
  createdAt
}

Tweet {
  _id
  author (ref: User)
  content
  likes []
  retweets []
  replies []
  createdAt
}
```

**Estimated Time:** 24 hours

---

### Project 4: E-commerce API

**Level:** Intermediate (Week 9-12)

**Objective:** Learn complex business logic and payment integration.

**Features:**

- ✅ User authentication
- ✅ Product catalog with categories
- ✅ Shopping cart management
- ✅ Order creation and tracking
- ✅ Payment integration (Stripe)
- ✅ Inventory management
- ✅ User reviews & ratings
- ✅ Admin panel API endpoints
- ✅ Order history

**Tech Stack:**

- Express.js
- PostgreSQL + Sequelize (for data integrity)
- JWT for authentication
- Stripe API for payments
- Postman for testing

**Learning Points:**

- Complex data relationships
- Inventory tracking
- Transaction handling
- Payment processing
- Admin vs Customer roles
- Order workflow
- Email notifications

**Database Schema:**

```
User {
  id
  email
  password (hashed)
  role (admin/customer)
}

Product {
  id
  name
  description
  price
  category
  inventory
  rating
}

Order {
  id
  userId
  items []
  total
  status (pending/completed/cancelled)
  paymentId
  createdAt
}
```

**Estimated Time:** 30 hours

---

## 🔴 Advanced Projects

### Project 5: Hospital Management System

**Level:** Advanced (Week 13-16)

**Objective:** Learn complex business logic and role-based access control.

**Features:**

- ✅ Patient management
- ✅ Doctor scheduling and availability
- ✅ Appointment booking & management
- ✅ Medical records management
- ✅ Prescription management
- ✅ Billing and payments
- ✅ Admin dashboard API
- ✅ Department management
- ✅ Doctor specializations
- ✅ Appointment reminders/notifications

**Tech Stack:**

- Express.js
- PostgreSQL + TypeORM
- JWT authentication
- Role-based access control
- Email service (Nodemailer)

**Learning Points:**

- Complex relationships (doctors, patients, appointments)
- Role-based authorization
- Data validation & constraints
- Business logic implementation
- Email notifications
- Report generation
- Security (HIPAA-like)

**Database Schema:**

```
Patient {
  id
  name
  email
  phone
  medicalHistory []
  appointments []
}

Doctor {
  id
  name
  specialization
  availableSlots []
  schedule
}

Appointment {
  id
  patientId
  doctorId
  dateTime
  status (scheduled/completed/cancelled)
  notes
}
```

**Estimated Time:** 40 hours

---

## 📊 Project Comparison

| Aspect     | Todo      | Blog     | Social       | E-commerce   | Hospital    |
| ---------- | --------- | -------- | ------------ | ------------ | ----------- |
| Difficulty | Beginner  | Beginner | Intermediate | Intermediate | Advanced    |
| Time       | 10h       | 12h      | 24h          | 30h          | 40h         |
| Database   | SQL/NoSQL | NoSQL    | NoSQL        | SQL          | SQL         |
| Auth       | None      | None     | JWT          | JWT          | JWT + Roles |
| Features   | 5         | 6        | 8            | 8            | 10          |

---

## Project Development Guidelines

### Before Starting

- [ ] Plan your database schema
- [ ] List all API endpoints
- [ ] Define error handling strategy
- [ ] Setup version control (Git)
- [ ] Create .env file structure

### During Development

- [ ] Write code incrementally
- [ ] Test each endpoint immediately
- [ ] Use Postman/Insomnia for testing
- [ ] Commit frequently to Git
- [ ] Document your API

### After Completion

- [ ] Write README with setup instructions
- [ ] Add .gitignore file
- [ ] Create API documentation
- [ ] Deploy to free platform
- [ ] Test in production
- [ ] Get feedback

---

## Testing Each Project

### Manual Testing

```bash
# Use Postman or Insomnia
# Create collection with all endpoints
# Test happy path and error cases
```

### Automated Testing (Optional)

```bash
npm install -D jest supertest

# Create test files
# Run: npm test
```

---

## Deployment Checklist

For each project:

- [ ] Environment variables configured
- [ ] Database setup complete
- [ ] API documentation written
- [ ] Error handling tested
- [ ] Security measures implemented
- [ ] Code reviewed
- [ ] Deployed to hosting platform
- [ ] Production database backup setup
- [ ] Monitoring configured
- [ ] Domain/URL working

---

## Hosting Options

| Project      | Recommended      | Free Tier | Notes             |
| ------------ | ---------------- | --------- | ----------------- |
| Todo API     | Heroku/Railway   | Yes       | Simple deployment |
| Blog API     | Railway/Render   | Yes       | Quick setup       |
| Social Media | DigitalOcean     | No        | Needs resources   |
| E-commerce   | AWS/DigitalOcean | Limited   | More complex      |
| Hospital     | AWS/DigitalOcean | Limited   | Production-ready  |

---

## Tips for Success

1. **Start Simple** - Don't add all features at once
2. **Build Incrementally** - One feature per commit
3. **Test Thoroughly** - Test each endpoint
4. **Version Control** - Commit frequently with clear messages
5. **Documentation** - Document API and code
6. **Error Handling** - Handle all error cases
7. **Security First** - Always validate and sanitize input
8. **Code Quality** - Write clean, readable code
9. **Deploy Early** - Get production experience
10. **Get Feedback** - Share with others

---

## Next Steps After Projects

- [ ] Build your own project idea
- [ ] Contribute to open source
- [ ] Learn advanced topics (caching, queues, etc.)
- [ ] Explore microservices
- [ ] Master DevOps & deployment
- [ ] Build full-stack applications
- [ ] Start freelancing/job hunting

---

**Start with Todo API and progressively build your skills! 🚀**

Last Updated: 2026-07-07
