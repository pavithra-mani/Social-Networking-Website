import { useEffect, useState } from "react";
import { getFeed } from "../services/feedApi";
import PostCard from "../components/PostCard";
import CreatePost from "../pages/CreatePost";
import SuggestedUsers from "../components/SuggestedUsers";
import { auth } from "../firebaseConfig";

const HomeFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  const currentUser = {
    uid: user?.uid || "",
    name: user?.displayName || "User",
    followers: 0
  };

  const suggestedUsers = [
    { uid: "2", name: "Rahul" },
    { uid: "3", name: "Neha" }
  ];

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const data = await getFeed();

        // SAFETY: ensure structure
        const safeData = data.map((post) => ({
          id: post.id,
          content: post.content || "",
          imageUrl: post.imageUrl || "",
          timestamp: post.timestamp || new Date().toISOString(),
          likeCount: post.likeCount || 0,
          isLiked: post.isLiked || false,
          author: {
            uid: post.author?.uid || "",
            name: post.author?.name || "Unknown",
            isFollowing: post.author?.isFollowing || false
          }
        }));

        setPosts(safeData);
      } catch (err) {
        console.error("Error loading feed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, []);

  const handleCreatePost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleFollowToggle = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
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
    );
  };

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
    );
  };

  const followingCount = posts.filter(
    (post) => post.author.isFollowing
  ).length;

  if (loading) {
    return <div style={{ color: "#fff", padding: "40px" }}>Loading feed...</div>;
  }

  return (
    <div style={styles.wrapper}>
      {/* MAIN FEED */}
      <div style={styles.feed}>
        <CreatePost onCreate={handleCreatePost} />

        {posts.length === 0 ? (
          <p style={{ color: "#aaa" }}>No posts yet.</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser.uid}
              onFollowToggle={handleFollowToggle}
              onLikeToggle={handleLikeToggle}
            />
          ))
        )}
      </div>

      {/* RIGHT SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.profileCard}>
          <h3>{currentUser.name}</h3>
          <p style={{ color: "#888" }}>@{currentUser.uid.slice(0, 6)}</p>

          <div style={styles.stats}>
            <span>{currentUser.followers} Followers</span>
            <span>{followingCount} Following</span>
          </div>
        </div>

        <SuggestedUsers
          users={suggestedUsers}
          posts={posts}
          onToggleFollow={(userId) => {
            setPosts((prev) =>
              prev.map((post) =>
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
            );
          }}
        />
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    padding: "40px",
    background: "#0a0a0a",
    minHeight: "100vh",
    color: "#fff"
  },
  feed: {
    width: "600px"
  },
  sidebar: {
    width: "300px"
  },
  profileCard: {
    background: "#1c1c1c",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
  },
  stats: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
    color: "#aaa",
    fontSize: "14px"
  }
};

export default HomeFeed;