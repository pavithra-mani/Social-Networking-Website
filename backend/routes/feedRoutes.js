const express = require("express");
const router = express.Router();
const db = require("../neo4j");

router.get("/", async (req, res) => {
  const session = db.session({ database: "irisdb" });

  try {
    const result = await session.run(`
      MATCH (u:User)-[:POSTED]->(p:Post)
      RETURN p, u
      ORDER BY p.timestamp DESC
    `);

    const posts = result.records.map((record) => {
      const p = record.get("p").properties;
      const u = record.get("u").properties;

      return {
        id: p.id,
        content: p.content,
        imageUrl: p.imageUrl || null,
        likeCount: p.likeCount?.toNumber?.() || 0,
        timestamp: p.timestamp?.toString(),
        isLiked: false,
        author: {
          uid: u.uid,
          name: u.name,
          isFollowing: false
        }
      };
    });

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch feed" });
  } finally {
    await session.close();
  }
});

module.exports = router;