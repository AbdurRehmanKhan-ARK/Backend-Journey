# Mega Project - Video Hosting Backend (YouTube-style)

Following [`hiteshchoudhary/chai-backend`](https://github.com/hiteshchoudhary/chai-backend) - a complete, production-shaped backend built with **Node.js, Express.js, MongoDB, Mongoose, JWT, and bcrypt.**

This isn't an isolated exercise - it ties together everything learned in the earlier modules (routing, schema design, auth, deployment) into one real, full-featured application: a video hosting platform similar to YouTube.

---

## Features

- User auth - signup, login, JWT access + refresh tokens
- Password hashing with bcrypt
- Video upload & storage (Cloudinary integration)
- Like / dislike
- Comment / reply
- Subscribe / unsubscribe
- Channel profile & watch history
- Aggregation pipelines for feeds and stats

---

## Tech Stack

`Node.js` · `Express.js` · `MongoDB` · `Mongoose` · `JWT` · `bcrypt` · `Cloudinary` · `Multer`

---

## ER Diagram

📐 [View on Eraser](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

---

## How to Run

**Requirements:** Node.js v18+, MongoDB connection string, Cloudinary credentials

```bash
npm install
npm run dev
```

Create a `.env` file with the required variables (Mongo URI, JWT secrets, Cloudinary keys) before running - see `.env.sample` if present.

---

## Notes

This repo is being built alongside the **Chai aur Code** backend playlist as the videos release. Progress is tracked commit by commit - controllers, routes, and middleware get added as each concept is covered.

Original reference project: [hiteshchoudhary/chai-backend](https://github.com/hiteshchoudhary/chai-backend)
