const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const messageRoutes = require("./routes/messageRoutes");
const searchRoutes = require("./routes/searchRoutes");

// NEW routes from feed-follow
const postRoutes = require("./routes/postRoutes");
const followRoutes = require("./routes/followRoutes");
const feedRoutes = require("./routes/feedRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Existing routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/search", searchRoutes);

// Feed-follow routes
app.use("/api/posts", postRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/feed", feedRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});