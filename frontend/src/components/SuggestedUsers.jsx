const SuggestedUsers = ({ users, posts, onToggleFollow }) => {
  const isUserFollowed = (userId) => {
    return posts.some(
      (post) => post.author.uid === userId && post.author.isFollowing
    )
  }

  return (
    <div style={styles.container}>
      <h3>Suggested Users</h3>

      {users.map((user) => {
        const followed = isUserFollowed(user.uid)

        return (
          <div key={user.uid} style={styles.row}>
            <span>{user.name}</span>

            <button
              style={{
                ...styles.button,
                background: followed ? "#6b7280" : "#3b82f6"
              }}
              onClick={() => onToggleFollow(user.uid)}
            >
              {followed ? "Following" : "Follow"}
            </button>
          </div>
        )
      })}
    </div>
  )
}

const styles = {
  container: {
    background: "#1f1f1f",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px"
  },
  button: {
    padding: "4px 10px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    color: "white"
  }
}

export default SuggestedUsers