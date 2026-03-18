const driver = require("../config/neo4j");

// Search users by interest based on the array property `u.interests`,
// which is how interests are stored in the profile routes.
exports.searchByInterest = async (req, res) => {
  const session = driver.session({ database: "irisdb" });
  const { interest } = req.query;

  if (!interest) {
    return res.status(400).json({ error: "Interest required" });
  }

  try {
    const result = await session.run(
      `
      MATCH (u:User)
      WHERE $interest IN u.interests
      RETURN u
      `,
      { interest }
    );

    const users = result.records.map((r) => r.get("u").properties);

    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Search failed" });
  } finally {
    await session.close();
  }
};