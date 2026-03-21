import React, { useState } from 'react';
import axios from 'axios';

const FollowButton = ({ targetUserId, currentUserId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async () => {
    console.log("Follow button clicked!", { targetUserId, currentUserId });
    if (!currentUserId || currentUserId === targetUserId) {
      console.log("Cannot follow - invalid user IDs");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/follow/', {
        followerUid: currentUserId,
        followingUid: targetUserId
      });
      
      console.log("Follow response:", response.data);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Follow toggle error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleToggleFollow();
    }}>
      <button 
        type="submit"
        disabled={loading || !currentUserId}
        style={{
          ...styles.button,
          backgroundColor: isFollowing ? '#ef4444' : '#3b82f6',
          opacity: loading ? 0.7 : 1,
          cursor: (loading || !currentUserId) ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
      </button>
    </form>
  );
};

const styles = {
  button: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    color: "white",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease"
  }
};

export default FollowButton;