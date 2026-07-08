require('dotenv').config()
const express = require("express"); // Express web framework
const app = express(); // Create an Express app
const port = 3000; // Port to listen on

// if app takes a request 'get' the root url (home) then send a response (req = request & res = response)
app.get("/", (req, res) => {
  res.send("Hello World from Home!");
});

app.get("/twitter", (req, res) => {
  res.send("Twitter");
});

app.get("/login", (req,res) => {
    res.send("<h1>Please Login at Chai aur Code<h1/>")
})

app.get("/youtube", (req,res) => {
    res.send("<h2>Chai Aur Code<h2/>")
})
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
