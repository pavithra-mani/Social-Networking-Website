import driver from "../config/neo4j.js"

export const toggleFollow = async (req, res) => {
  const { followerId, followingId } = req.body

  const session = driver.session()

  try {
    const check = await session.run(
      `
      MATCH (a:User {uid:$followerId})-[r:FOLLOWS]->(b:User {uid:$followingId})
      RETURN r
      `,
      { followerId, followingId }
    )

    if (check.records.length > 0) {
      await session.run(
        `
        MATCH (a:User {uid:$followerId})-[r:FOLLOWS]->(b:User {uid:$followingId})
        DELETE r
        `,
        { followerId, followingId }
      )

      return res.json({ message: "Unfollowed user" })
    } else {
      await session.run(
        `
        MATCH (a:User {uid:$followerId}), (b:User {uid:$followingId})
        CREATE (a)-[:FOLLOWS]->(b)
        `,
        { followerId, followingId }
      )

      return res.json({ message: "Followed user" })
    }

  } catch (error) {
    res.status(500).json(error)
  } finally {
    await session.close()
  }
}