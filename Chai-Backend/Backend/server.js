import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Server is Ready gentlemen");
});

// get a list of 5 jokes
app.get("/api/jokes", (req, res) => {
  const jokes = [
    {
      id: 1,
      title: "Why did the scarecrow win an award?",
      content: "this is a joke",
    },
    {
      id: 2,
      title: "Why did the chicken cross the road?",
      content: "this is a joke",
    },
    {
      id: 3,
      title: "Why did the tomato turn red?",
      content: "this is a joke",
    },
    {
      id: 4,
      title: "what do you call a fake noodle?",
      content: "this is a joke",
    },
    {
      id: 5,
      title: "how do you organize a space party?",
      content: "this is a joke",
    },
  ];
  res.send(jokes);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
