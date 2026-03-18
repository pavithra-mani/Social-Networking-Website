const driver = require("../config/neo4j");

exports.sendMessage = async (req, res) => {
  const session = driver.session({ database: "irisdb" });
  const { sender, receiver, text } = req.body;

  if (!sender || !receiver || !text) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    await session.run(
      `
      CREATE (m:Message {
        id: randomUUID(),
        text: $text,
        timestamp: datetime()
      })
      WITH m
      MATCH (a:User {uid:$sender})
      MATCH (b:User {uid:$receiver})
      CREATE (a)-[:SENT]->(m)
      CREATE (m)-[:TO]->(b)
      `,
      { sender, receiver, text }
    );

    res.status(201).json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to send message" });
  } finally {
    await session.close();
  }
};

exports.getChat = async (req, res) => {
  const session = driver.session({ database: "irisdb" });
  const { me } = req.query;
  const friend = req.params.friendId;

  try {
    const result = await session.run(
      `
      MATCH (u1:User {uid:$me})-[:SENT]->(m)-[:TO]->(u2:User {uid:$friend})
      RETURN m.text AS text, m.timestamp AS timestamp, $me AS sender

      UNION

      MATCH (u2:User {uid:$friend})-[:SENT]->(m)-[:TO]->(u1:User {uid:$me})
      RETURN m.text AS text, m.timestamp AS timestamp, $friend AS sender

      ORDER BY timestamp
      `,
      { me, friend }
    );

    const messages = result.records.map(r => ({
      text: r.get("text"),
      timestamp: r.get("timestamp"),
      sender: r.get("sender")
    }));

    res.json(messages);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch chat" });
  } finally {
    await session.close();
  }
};