const FollowButton = ({ isFollowing, onToggle }) => {
  return (
    <button onClick={onToggle} style={styles.button}>
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  )
}

const styles = {
  button: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#3b82f6",
    color: "white"
  }
}

export default FollowButton