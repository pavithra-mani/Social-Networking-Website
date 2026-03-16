const express = require("express");
const router = express.Router();
const driver = require("../neo4j");
const verifyToken = require("../middleware/verifyToken");

// GET /api/profile/:uid
router.get("/:uid", verifyToken, async (req, res) => {
  const { uid } = req.params;
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {uid: $uid}) RETURN u`,
      { uid }
    );
    if (result.records.length === 0) {
      return res.status(404).json({ error: "User not found in Neo4j" });
    }
    const raw = result.records[0].get("u").properties;

    // Convert Neo4j integers to plain JS numbers
    const user = {
      ...raw,
      followers: raw.followers ? raw.followers.low ?? raw.followers : 0,
      following: raw.following ? raw.following.low ?? raw.following : 0,
    };

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch profile" });
  } finally {
    await session.close();
  }
});


// PUT /api/profile/bio
router.put("/bio", verifyToken, async (req, res) => {
  const { uid, bio } = req.body;
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

// PUT /api/profile/interests/add
router.put("/interests/add", verifyToken, async (req, res) => {
  const { uid, interest } = req.body;
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {uid: $uid})
       SET u.interests = 
         CASE 
           WHEN NOT $interest IN u.interests 
           THEN u.interests + $interest 
           ELSE u.interests 
         END`,
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

// PUT /api/profile/interests/remove
router.put("/interests/remove", verifyToken, async (req, res) => {
  const { uid, interest } = req.body;
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {uid: $uid})
       SET u.interests = [x IN u.interests WHERE x <> $interest]`,
      { uid, interest }
    );
    res.json({ message: "Interest removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove interest" });
  } finally {
    await session.close();
  }
});

module.exports = router;