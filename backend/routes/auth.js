const express = require("express");
const router = express.Router();
const driver = require("../neo4j");

// POST /api/auth/register
// Called after Firebase signup to save user in Neo4j
router.post("/register", async (req, res) => {
  const { uid, name, email } = req.body;

  const session = driver.session();
  try {
    await session.run(
      `CREATE (u:User {
        uid: $uid,
        name: $name,
        email: $email,
        bio: "",
        createdAt: datetime()
      })`,
      { uid, name, email }
    );
    res.status(201).json({ message: "User created in Neo4j" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  } finally {
    await session.close();
  }
});

module.exports = router;