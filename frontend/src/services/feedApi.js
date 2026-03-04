export const getFeed = async () => {
  return [
    {
      id: "1",
      content: "Learning Neo4j is interesting",
      imageUrl: "",
      timestamp: new Date().toISOString(),
      author: {
        uid: "2",
        name: "Rahul",
        isFollowing: false
      },
      likeCount: 5,
      isLiked: false
    },
    {
      id: "2",
      content: "React state management is powerful",
      imageUrl: "",
      timestamp: new Date().toISOString(),
      author: {
        uid: "3",
        name: "Neha",
        isFollowing: false
      },
      likeCount: 2,
      isLiked: false
    }
  ]
}