const driver = require("../config/neo4j");

// FOLLOW USER
const followUser = async (req, res) => {
  const { followerUid, followingUid } = req.body;
  const session = driver.session({ database: "irisdb" });

  try {
    await session.run(
      `
      MATCH (a:User {uid:$followerUid}), (b:User {uid:$followingUid})
      MERGE (a)-[:FOLLOWS]->(b)
      `,
      { followerUid, followingUid }
    );

    res.status(200).json({
      message: "User followed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  } finally {
    await session.close();
  }
};

// TOGGLE FOLLOW (follow/unfollow)
const toggleFollow = async (req, res) => {
  const { followerUid, followingUid } = req.body;
  const session = driver.session();

  try {
    const check = await session.run(
      `
      MATCH (a:User {uid:$followerUid})-[r:FOLLOWS]->(b:User {uid:$followingUid})
      RETURN r
      `,
      { followerUid, followingUid }
    );

    if (check.records.length > 0) {
      await session.run(
        `
        MATCH (a:User {uid:$followerUid})-[r:FOLLOWS]->(b:User {uid:$followingUid})
        DELETE r
        `,
        { followerUid, followingUid }
      );

      return res.json({ message: "Unfollowed user" });
    } else {
      await session.run(
        `
        MATCH (a:User {uid:$followerUid}), (b:User {uid:$followingUid})
        CREATE (a)-[:FOLLOWS]->(b)
        `,
        { followerUid, followingUid }
      );

      return res.json({ message: "Followed user" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  } finally {
    await session.close();
  }
};

module.exports = { followUser, toggleFollow };