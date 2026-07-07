# Commands Cheatsheet

Quick reference for common commands used in backend development.

---

## Node.js & npm Commands

```bash
# Check versions
node -v
npm -v

# Initialize new project
npm init
npm init -y                          # Skip questions

# Install packages
npm install <package>                # Production dependency
npm install -D <package>             # Development dependency
npm install -g <package>             # Global installation

# Update packages
npm update
npm outdated                         # Check outdated packages

# Remove packages
npm uninstall <package>
npm uninstall -D <package>

# Run scripts from package.json
npm start
npm run dev
npm test

# View installed packages
npm list
npm list --depth=0                   # Top level only

# Clear cache
npm cache clean --force
```

---

## Git Commands

```bash
# Initial setup
git init                             # Initialize repository
git config user.name "Your Name"
git config user.email "your@email.com"

# Staging and committing
git status                           # Check status
git add .                            # Stage all changes
git add <filename>                   # Stage specific file
git commit -m "message"              # Commit changes
git commit -am "message"             # Stage and commit tracked files

# Branching
git branch                           # List branches
git branch <branch-name>             # Create new branch
git checkout <branch-name>           # Switch branch
git checkout -b <branch-name>        # Create and switch to branch
git branch -D <branch-name>          # Delete branch

# Remote operations
git remote -v                        # View remote repositories
git remote add origin <url>          # Add remote
git push origin main                 # Push to remote
git push -u origin main              # Push and set upstream
git pull origin main                 # Pull from remote
git fetch origin                     # Fetch without merging

# Viewing history
git log                              # View commit history
git log --oneline                    # Compact view
git diff                             # View changes
git show <commit>                    # View specific commit

# Undoing changes
git reset --soft HEAD~1              # Undo last commit (keep changes)
git reset --hard HEAD~1              # Undo last commit (discard changes)
git revert <commit>                  # Create new commit that undoes changes
```

---

## MongoDB Commands

```bash
# Start MongoDB
mongosh                              # Connect to MongoDB
# or
mongo                                # (older version)

# Database operations
show dbs                             # List all databases
use <database-name>                  # Switch/create database
db                                   # Current database
db.dropDatabase()                    # Delete database

# Collection operations
show collections                     # List all collections
db.<collection>.drop()               # Delete collection

# CRUD operations
db.<collection>.insertOne({...})     # Insert single document
db.<collection>.insertMany([...])    # Insert multiple documents
db.<collection>.find()               # Find all documents
db.<collection>.findOne({...})       # Find one document
db.<collection>.updateOne({...}, {$set: {...}})     # Update one
db.<collection>.updateMany({...}, {$set: {...}})    # Update many
db.<collection>.deleteOne({...})     # Delete one document
db.<collection>.deleteMany({...})    # Delete many documents

# Querying
db.<collection>.find({field: value})                 # Exact match
db.<collection>.find({field: {$gt: value}})         # Greater than
db.<collection>.find({field: {$lt: value}})         # Less than
db.<collection>.find({field: {$in: [val1, val2]}})  # In array

# Indexing
db.<collection>.createIndex({field: 1})             # Create index
db.<collection>.getIndexes()                        # View indexes
db.<collection>.dropIndex({field: 1})               # Drop index
```

---

## PostgreSQL Commands

```bash
# Connect to PostgreSQL
psql -U postgres                     # Connect as postgres user
psql -U postgres -d <database>       # Connect to specific database

# Database operations (in psql)
\l                                   # List databases
CREATE DATABASE <name>;              # Create database
DROP DATABASE <name>;                # Delete database
\c <database>                        # Connect to database

# Table operations
\d                                   # List tables
\d <table>                           # Describe table
CREATE TABLE ...                     # Create table
DROP TABLE <table>;                  # Delete table

# Data operations
SELECT * FROM <table>;               # View all rows
SELECT * FROM <table> WHERE id=1;    # View with condition
INSERT INTO <table> VALUES (...);    # Insert row
UPDATE <table> SET col=val WHERE ...; # Update rows
DELETE FROM <table> WHERE ...;       # Delete rows

# User operations
\du                                  # List users
CREATE USER <user> WITH PASSWORD '<pass>';
ALTER ROLE <user> CREATEDB;
GRANT ALL ON DATABASE <db> TO <user>;

# Other
\q                                   # Quit psql
\h                                   # Help
```

---

## Postman/API Testing

```bash
# Common HTTP Methods
GET     /api/resource              # Retrieve data
POST    /api/resource              # Create data
PUT     /api/resource/:id          # Update entire resource
PATCH   /api/resource/:id          # Partial update
DELETE  /api/resource/:id          # Delete data

# Common Status Codes
200     OK - Request successful
201     Created - Resource created
400     Bad Request - Invalid input
401     Unauthorized - Authentication required
403     Forbidden - No permission
404     Not Found - Resource doesn't exist
500     Internal Server Error
```

---

## Express Middleware

```bash
# Common middleware to install
npm install cors                     # Handle CORS
npm install helmet                   # Security headers
npm install morgan                   # HTTP logging
npm install express-validator        # Input validation
npm install express-rate-limit       # Rate limiting
npm install multer                   # File uploads
```

---

## Environment & Configuration

```bash
# Create .env file
echo. > .env                         # Windows PowerShell
touch .env                           # Mac/Linux

# Common .env variables
PORT=3000
NODE_ENV=development
DATABASE_URL=...
JWT_SECRET=...
API_KEY=...
```

---

## Testing

```bash
# Install testing tools
npm install -D jest supertest

# Create test file
touch src/__tests__/example.test.js

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## Debugging

```bash
# Enable debug mode
DEBUG=* npm start                    # All debug logs
DEBUG=express:* npm start            # Express debug logs

# Node debugger
node --inspect server.js             # Inspector mode
node --inspect-brk server.js         # Break on start

# In Chrome
chrome://inspect                     # Access DevTools
```

---

## Docker (Optional)

```bash
# Docker commands
docker build -t <image-name> .       # Build image
docker run -p 3000:3000 <image>      # Run container
docker ps                            # List containers
docker stop <container-id>           # Stop container
docker logs <container-id>           # View logs
```

---

## Deployment Commands

### Heroku

```bash
npm install -g heroku-cli            # Install Heroku CLI
heroku login                         # Login to Heroku
heroku create <app-name>             # Create app
git push heroku main                 # Deploy
heroku logs --tail                   # View logs
heroku config:set VAR=value          # Set environment variable
```

### DigitalOcean

```bash
ssh root@<ip-address>                # SSH into droplet
apt-get update                       # Update packages
apt-get install nodejs npm           # Install Node.js
git clone <repo-url>                 # Clone repository
npm install                          # Install dependencies
npm start                            # Start app
```

---

## Package.json Quick Commands

```bash
# View package.json scripts
npm run

# Common scripts to add
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "lint": "eslint .",
    "build": "tsc",
    "seed": "node scripts/seed.js"
  }
}
```

---

## Useful One-Liners

```bash
# Kill process on port 3000
netstat -ano | findstr :3000          # Windows
lsof -i :3000                         # Mac/Linux

# Reinstall packages
rm -rf node_modules package-lock.json && npm install

# Check outdated packages
npm outdated

# Clean npm cache
npm cache clean --force

# Clear terminal
clear                                 # Mac/Linux
cls                                  # Windows
```

---

**Bookmark this page for quick reference! 🚀**

Last Updated: 2026-07-07
