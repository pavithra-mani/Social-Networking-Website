import driver from "../config/neo4j.js"

export const followUser = async (req, res) => {

  const { followerUid, followingUid } = req.body

  const session = driver.session()

  try {

    const result = await session.run(
      `
      MATCH (a:User {uid:$followerUid}), (b:User {uid:$followingUid})
      MERGE (a)-[:FOLLOWS]->(b)
      RETURN a,b
      `,
      { followerUid, followingUid }
    )

    res.status(200).json({
      message: "User followed successfully"
    })

  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }

  await session.close()
}

export const toggleFollow = async (req, res) => {
  const { followerUId, followingUId } = req.body

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