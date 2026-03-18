const driver = require("../config/neo4j");

// GET FEED
const getFeed = async (req, res) => {
  const { uid } = req.params;
  const session = driver.session({ database: "irisdb" });

  try {
    const result = await session.run(
      `
      MATCH (u:User {uid:$uid})-[:FOLLOWS]->(f:User)-[:POSTED]->(p:Post)
      RETURN f.name AS author, p
      ORDER BY p.timestamp DESC
      `,
      { uid }
    );

    const posts = result.records.map((record) => ({
      author: record.get("author"),
      post: record.get("p").properties,
    }));

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  } finally {
    await session.close();
  }
};

module.exports = { getFeed };