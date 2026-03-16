const driver = require("../config/neo4j");

exports.searchByInterest = async (req, res) => {
  const session = driver.session();
  const { interest } = req.query;

  if (!interest) {
    return res.status(400).json({ error: "Interest required" });
  }

  try {
    const result = await session.run(
      `
      MATCH (u:User)-[:INTERESTED_IN]->(i:Interest {name:$interest})
      RETURN u
      `,
      { interest }
    );

    const users = result.records.map(r => r.get("u").properties);

    res.json(users);
  } catch (e) {
    res.status(500).json({ error: "Search failed" });
  } finally {
    await session.close();
  }
};