const express = require("express");
const router = express.Router();
const db = require("../neo4j");


router.post("/", async (req, res) => {
  const { content, imageUrl, uid } = req.body;
  const session = db.session({ database: "irisdb" });

  try {
    const result = await session.run(
      `
      MERGE (u:User {uid: $uid})
      ON CREATE SET u.name = "Anonymous"

      CREATE (p:Post {
        id: randomUUID(),
        content: $content,
        imageUrl: $imageUrl,
        timestamp: datetime(),
        likeCount: 0
      })

      CREATE (u)-[:POSTED]->(p)
      RETURN p, u
      `,
      { content, imageUrl, uid }
    );

    const record = result.records[0];

    res.json({
      id: record.get("p").properties.id,
      content,
      imageUrl,
      timestamp: new Date().toISOString(),
      likeCount: 0,
      isLiked: false,
      author: {
        uid,
        name: record.get("u").properties.name,
        isFollowing: false
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Post failed" });
  } finally {
    await session.close();
  }
});

module.exports = router;