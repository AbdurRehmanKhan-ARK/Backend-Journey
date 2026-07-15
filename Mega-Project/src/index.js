import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is listening on port ${process.env.PORT}`)
    })
  })
  .catch((error) => {
    console.log("Error in database connection", error);
  });

/*

THIS IS THE FIRST APPROACH OF CONNECTION A DATABASE IN MERN PROJECT USING MONGOOSE LIBRARY
THE SECOND APPROACH IS IN THE `db/index.js` FILE (MORE PROFESSIONAL)

import express from "express";
const app = express();

// making an IEFI (Immediately Executed Function Expression)
(async function () {
    try {
        await mongoose.connect(`process.env.MONGODB_URI/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("Error : ", error);
            throw error
        }) // listening for requests/events, like if database is though connected but our express app can't communicate with import PropTypes from 'prop-types'
        
        app.listen(process.env.PORT, () => {
            console.log("app is listening on port ${process.env.PORT}");
        })
    } catch {
        console.log("Error in database connection");       
    }
})()

*/
