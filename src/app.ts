import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hello, Saturn-AI-BE!");
});

app.listen(PORT, () => {
  console.log(`Server running at port: ${PORT}`);
});
