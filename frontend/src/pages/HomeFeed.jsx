import { useEffect, useState } from "react"
import { getFeed } from "../services/feedApi"
import PostCard from "../components/PostCard"
import CreatePost from "../components/CreatePost"
import SuggestedUsers from "../components/SuggestedUsers"

const HomeFeed = () => {

  const suggestedUsers = [
    { uid: "2", name: "Rahul" },
    { uid: "3", name: "Neha" }
  ]

  const handleSuggestedFollow = (userId) => {
    setPosts((prev) => {
      let updatedPosts = prev.map((post) =>
        post.author.uid === userId
          ? {
            ...post,
            author: {
              ...post.author,
              isFollowing: !post.author.isFollowing
            }
          }
          : post
      )

      // Check if now following
      const isNowFollowing = updatedPosts.some(
        (post) =>
          post.author.uid === userId && post.author.isFollowing
      )

      if (isNowFollowing) {
        // Find most recent post of that user
        const userPosts = updatedPosts.filter(
          (post) => post.author.uid === userId
        )

        if (userPosts.length > 0) {
          const mostRecent = userPosts.sort(
            (a, b) =>
              new Date(b.timestamp) - new Date(a.timestamp)
          )[0]

          // Remove it from current position
          updatedPosts = updatedPosts.filter(
            (post) => post.id !== mostRecent.id
          )

          // Push to bottom
          updatedPosts.push(mostRecent)
        }
      }

      return updatedPosts
    })
  }

  const currentUser = {
    uid: "1",
    name: "Arunank",
    followers: 10
  }


  const [posts, setPosts] = useState([])

  const followingCount = posts.filter(
    (post) => post.author.isFollowing
  ).length

  useEffect(() => {
    const loadFeed = async () => {
      const data = await getFeed()
      setPosts(data)
    }
    loadFeed()
  }, [])

  const handleCreatePost = (newPost) => {
    setPosts((prev) => [newPost, ...prev])
  }

  const handleFollowToggle = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
            ...post,
            author: {
              ...post.author,
              isFollowing: !post.author.isFollowing
            }
          }
          : post
      )
    )
  }

  const handleLikeToggle = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
            ...post,
            isLiked: !post.isLiked,
            likeCount: post.isLiked
              ? post.likeCount - 1
              : post.likeCount + 1
          }
          : post
      )
    )
  }

return (
  <div style={styles.wrapper}>
    <div style={styles.feed}>
      <CreatePost onCreate={handleCreatePost} />

      {posts
        .filter(
          (post) =>
            post.author.uid === currentUser.uid ||
            post.author.isFollowing
        )
        .map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUser.uid}
            onFollowToggle={handleFollowToggle}
            onLikeToggle={handleLikeToggle}
          />
        ))}
    </div>

    <div style={styles.rightSidebar}>
      <div style={styles.profileCard}>
        <h3>{currentUser.name}</h3>
        <p style={{ color: "#888" }}>@arunank_05</p>
        <div style={styles.stats}>
          <span>Followers: {currentUser.followers}</span>
          <span>Following: {followingCount}</span>
        </div>
      </div>

      <SuggestedUsers
        users={suggestedUsers}
        posts={posts}
        onToggleFollow={handleSuggestedFollow}
      />
    </div>
  </div>
)


}

const styles = {
  wrapper: {
  marginLeft: "270px",
  display: "flex",
  justifyContent: "center",
  gap: "80px",
  paddingTop: "40px",
  paddingRight: "40px"
},
  feed: {
    width: "580px"
  },
  rightSidebar: {
    width: "320px",
    position: "sticky",
    top: "40px",
    height: "fit-content"
  },
  profileCard: {
    background: "#111",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "25px"
  },
  stats: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
    color: "#aaa",
    fontSize: "14px"
  }
}

export default HomeFeed