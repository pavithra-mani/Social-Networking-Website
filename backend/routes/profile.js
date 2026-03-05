const express = require("express");
const router = express.Router();
const driver = require("../neo4j");

// GET /api/profile/:uid
// Fetch a user's profile
router.get("/:uid", async (req, res) => {
  const { uid } = req.params;
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {uid: $uid})
       OPTIONAL MATCH (u)-[:INTERESTED_IN]->(i:Interest)
       RETURN u, collect(i.name) AS interests`,
      { uid }
    );
    const user = result.records[0].get("u").properties;
    const interests = result.records[0].get("interests");
    res.json({ ...user, interests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch profile" });
  } finally {
    await session.close();
  }
});

// PUT /api/profile/:uid/bio
// Edit bio
router.put("/:uid/bio", async (req, res) => {
  const { uid } = req.params;
  const { bio } = req.body;
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {uid: $uid}) SET u.bio = $bio`,
      { uid, bio }
    );
    res.json({ message: "Bio updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update bio" });
  } finally {
    await session.close();
  }
});

// POST /api/profile/:uid/interests
// Add an interest
router.post("/:uid/interests", async (req, res) => {
  const { uid } = req.params;
  const { interest } = req.body;
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {uid: $uid})
       MERGE (i:Interest {name: $interest})
       MERGE (u)-[:INTERESTED_IN]->(i)`,
      { uid, interest }
    );
    res.json({ message: "Interest added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add interest" });
  } finally {
    await session.close();
  }
});

module.exports = router;