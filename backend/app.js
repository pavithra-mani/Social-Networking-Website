const express = require("express");
const cors = require("cors");

const messageRoutes = require("./routes/messageRoutes");
const searchRoutes = require("./routes/searchRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

app.get("/", (req, res) => {
  res.send("API running");
});

app.get("/test", (req, res) => {
  res.send("Test route working");
});

// ENABLE THESE
app.use("/api/messages", messageRoutes);
app.use("/api/search", searchRoutes);

module.exports = app;