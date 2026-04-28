const express = require("express");

const cors = require("cors");
const morgan = require('morgan');
require("dotenv").config();

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const messageRoutes = require("./routes/messageRoutes");
const searchRoutes = require("./routes/searchRoutes");
const postRoutes = require("./routes/postRoutes");
const followRoutes = require("./routes/followRoutes");
const feedRoutes = require("./routes/feedRoutes");

const app = express();
const PORT = process.env.PORT || 5001;
const logFile = 'C:\\Users\\Prajwal\\Desktop\\backend.log';

// CORS
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
  credentials: false,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(morgan('[:date[iso]] :method :url :status :response-time ms'));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/feed", feedRoutes);

app.get("/", (req, res) => res.send("Backend is running!"));

app.get("/api/debug/follows", async (req, res) => {
  try {
    const session = require("./config/neo4j").session({ database: "irisdb" });
    const result = await session.run("MATCH (a:User)-[r:FOLLOWS]->(b:User) RETURN a.uid, b.uid, r");
    const follows = result.records.map(record => ({
      follower: record.get("a.uid"),
      following: record.get("b.uid"),
      relationship: record.get("r")
    }));
    await session.close();
    res.json({ follows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/debug/neo4j", async (req, res) => {
  try {
    await require("./neo4j").verifyConnectivity();
    const session = require("./neo4j").session({ database: "irisdb" });
    try {
      const result = await session.run("MATCH (u:User) RETURN count(u) AS users");
      const users = result.records[0].get("users").toNumber?.() ?? result.records[0].get("users");
      res.json({ ok: true, database: "irisdb", users });
    } finally {
      await session.close();
    }
  } catch (e) {
    res.json({ ok: false, error: e.message, fallback: true });
  }
});

// Single app.listen with startup log write
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
});