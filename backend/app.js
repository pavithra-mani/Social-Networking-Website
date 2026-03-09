const express = require("express");
const cors = require("cors");

const messageRoutes = require("./routes/messageRoutes");
const searchRoutes = require("./routes/searchRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/messages", messageRoutes);
app.use("/api/search", searchRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

module.exports = app;