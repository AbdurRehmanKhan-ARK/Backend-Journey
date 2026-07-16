import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
// whenever we are using middleware or config settings, we need to use app.use() because, cors also have options to configure
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // whitelist, which origins are allowed to make requests
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" })); // forms etc, json data etc
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // there are various ways to parse urlencoded data
app.use(cookieParser());
app.use(express.static("public")); // to store static files

// routes import

import userRouter from "./routes/userRoutes.js";

app.use("/api/v1/users", userRouter); // all routes starting with /users will be handled by userRouter
// URL: http://localhost:8000/api/v1/users/

export { app };
