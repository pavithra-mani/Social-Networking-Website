const neo4j = require("neo4j-driver");

// Use the local Neo4j instance that you're viewing in Neo4j Browser,
// so what the app writes is exactly what you see there.
const driver = neo4j.driver(
  "neo4j://127.0.0.1:7687",
  neo4j.auth.basic("neo4j", "passwords")
);

module.exports = driver;