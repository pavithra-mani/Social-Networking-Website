const express = require("express");
const router = express.Router();
const db = require("../neo4j");

// Mock data for when Neo4j is not available
const mockPosts = [
  {
    id: "1",
    content: "Welcome to Iris! Your social networking platform.",
    imageUrl: null,
    likeCount: 5,
    timestamp: new Date().toISOString(),
    isLiked: false,
    author: {
      uid: "demo-user-1",
      name: "Demo User",
      isFollowing: false
    }
  },
  {
    id: "2",
    content: "This is a sample post to show how the feed works.",
    imageUrl: null,
    likeCount: 3,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isLiked: false,
    author: {
      uid: "demo-user-2",
      name: "Another User",
      isFollowing: false
    }
  }
];

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
    console.error("Neo4j feed error, using mock data:", err);
    // Fallback to mock data when Neo4j is not available
    res.json(mockPosts);
  } finally {
    await session.close();
  }
});

module.exports = router;