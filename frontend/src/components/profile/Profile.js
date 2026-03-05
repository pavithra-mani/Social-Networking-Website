import React, { useState, useEffect } from "react";
import { auth } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .profile-page {
    min-height: 100vh;
    background: #fafafa;
    font-family: 'Inter', sans-serif;
    color: #0a0a0a;
  }

  /* NAV */
  .iris-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 60px;
    background: #fff;
    border-bottom: 1px solid #efefef;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    z-index: 100;
  }

  .iris-nav-logo {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.5px;
    color: #0a0a0a;
    font-style: italic;
  }

  .iris-nav-logo span { color: #c9a96e; }

  .iris-nav-actions {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .nav-icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0a0a0a;
    transition: background 0.2s;
  }

  .nav-icon-btn:hover { background: #f0f0f0; }

  /* MAIN LAYOUT */
  .profile-main {
    max-width: 935px;
    margin: 0 auto;
    padding: 80px 20px 40px;
  }

  /* PROFILE HEADER */
  .profile-header {
    display: flex;
    align-items: flex-start;
    gap: 60px;
    padding: 32px 0 40px;
    border-bottom: 1px solid #efefef;
    margin-bottom: 40px;
  }

  .avatar-wrapper {
    position: relative;
    flex-shrink: 0;
  }

  .avatar-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, #c9a96e, #e8c98a, #a07840);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 42px;
    font-weight: 300;
    color: white;
    letter-spacing: -1px;
  }

  .profile-info { flex: 1; }

  .profile-username-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .profile-username {
    font-size: 24px;
    font-weight: 300;
    color: #0a0a0a;
    letter-spacing: -0.3px;
  }

  .edit-profile-btn {
    padding: 7px 18px;
    background: transparent;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #0a0a0a;
    cursor: pointer;
    transition: background 0.2s;
  }

  .edit-profile-btn:hover { background: #f5f5f5; }

  .edit-profile-btn.active {
    background: #0a0a0a;
    color: white;
    border-color: #0a0a0a;
  }

  .profile-stats {
    display: flex;
    gap: 36px;
    margin-bottom: 20px;
  }

  .stat-item { text-align: left; }

  .stat-number {
    font-size: 17px;
    font-weight: 600;
    color: #0a0a0a;
    display: block;
  }

  .stat-label {
    font-size: 13px;
    color: #737373;
    font-weight: 400;
  }

  .profile-bio-section { margin-bottom: 16px; }

  .profile-bio-text {
    font-size: 14px;
    color: #0a0a0a;
    line-height: 1.6;
    font-weight: 400;
    white-space: pre-wrap;
  }

  .bio-placeholder {
    font-size: 14px;
    color: #aaa;
    font-style: italic;
  }

  /* EDIT BIO */
  .bio-edit-area {
    width: 100%;
    max-width: 400px;
    padding: 10px 12px;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #0a0a0a;
    resize: none;
    outline: none;
    line-height: 1.6;
    transition: border-color 0.2s;
    background: #fff;
  }

  .bio-edit-area:focus { border-color: #0a0a0a; }

  .bio-save-btn {
    margin-top: 8px;
    padding: 7px 20px;
    background: #0a0a0a;
    color: white;
    border: none;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .bio-save-btn:hover { opacity: 0.85; }

  /* INTERESTS */
  .interests-section { margin-top: 8px; }

  .interests-label {
    font-size: 12px;
    font-weight: 600;
    color: #737373;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
    display: block;
  }

  .interests-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .interest-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    background: #f0f0f0;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 400;
    color: #0a0a0a;
    transition: background 0.2s;
  }

  .interest-tag.editable { background: #fff; border: 1px solid #dbdbdb; }

  .remove-tag-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #737373;
    font-size: 14px;
    line-height: 1;
    padding: 0;
    display: flex;
    align-items: center;
    transition: color 0.2s;
  }

  .remove-tag-btn:hover { color: #e74c3c; }

  .add-interest-row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 8px;
  }

  .interest-input {
    padding: 7px 12px;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #0a0a0a;
    outline: none;
    transition: border-color 0.2s;
    width: 180px;
  }

  .interest-input:focus { border-color: #0a0a0a; }

  .add-interest-btn {
    padding: 7px 16px;
    background: #0a0a0a;
    color: white;
    border: none;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .add-interest-btn:hover { opacity: 0.85; }

  /* POSTS GRID */
  .posts-section {}

  .posts-tabs {
    display: flex;
    border-top: 1px solid #efefef;
    margin-bottom: 24px;
  }

  .posts-tab {
    flex: 1;
    text-align: center;
    padding: 14px 0;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #737373;
    border-top: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
  }

  .posts-tab.active {
    color: #0a0a0a;
    border-top-color: #0a0a0a;
  }

  .posts-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3px;
  }

  .post-cell {
    aspect-ratio: 1;
    background: #efefef;
    overflow: hidden;
    cursor: pointer;
    position: relative;
  }

  .post-cell:hover .post-overlay { opacity: 1; }

  .post-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    color: white;
    font-size: 13px;
    font-weight: 600;
    gap: 16px;
  }

  .post-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #f0ede8, #e8e4de);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ccc;
    font-size: 28px;
  }

  .empty-posts {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    color: #737373;
  }

  .empty-posts-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.3;
  }

  .empty-posts p {
    font-size: 14px;
    font-weight: 400;
  }

  /* LOGOUT */
  .logout-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #737373;
    padding: 6px 10px;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .logout-btn:hover { color: #e74c3c; background: #fff0f0; }

  /* LOADING */
  .loading-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    font-size: 14px;
    color: #737373;
    font-family: 'Inter', sans-serif;
  }

  .toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: #0a0a0a;
    color: white;
    padding: 10px 24px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 400;
    z-index: 999;
    animation: toastIn 0.3s ease;
  }

  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;

function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) return navigate("/");
      setUser(firebaseUser);
      try {
        const token = await firebaseUser.getIdToken();
        const res = await axios.get(`http://localhost:5000/api/profile/${firebaseUser.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        setBio(res.data.bio || "");
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSaveBio = async () => {
    try {
      const token = await user.getIdToken();
      await axios.put("http://localhost:5000/api/profile/bio", { uid: user.uid, bio }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(prev => ({ ...prev, bio }));
      setEditing(false);
      showToast("Bio updated");
    } catch (err) {
      showToast("Failed to update bio");
    }
  };

  const handleAddInterest = async () => {
    const trimmed = newInterest.trim();
    if (!trimmed) return;
    if (profile.interests?.includes(trimmed)) {
      showToast("Interest already added");
      return;
    }
    try {
      const token = await user.getIdToken();
      await axios.put("http://localhost:5000/api/profile/interests/add", {
        uid: user.uid, interest: trimmed
      }, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(prev => ({ ...prev, interests: [...(prev.interests || []), trimmed] }));
      setNewInterest("");
      showToast("Interest added");
    } catch (err) {
      showToast("Failed to add interest");
    }
  };

  const handleRemoveInterest = async (interest) => {
    try {
      const token = await user.getIdToken();
      await axios.put("http://localhost:5000/api/profile/interests/remove", {
        uid: user.uid, interest
      }, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
      showToast("Interest removed");
    } catch (err) {
      showToast("Failed to remove interest");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (!profile) return <div className="loading-screen">Loading...</div>;

  const initials = profile.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <style>{styles}</style>
      <div className="profile-page">

        {/* NAV */}
        <nav className="iris-nav">
          <span className="iris-nav-logo">Iri<span>s</span></span>
          <div className="iris-nav-actions">
            <button className="logout-btn" onClick={handleLogout}>Log out</button>
          </div>
        </nav>

        <div className="profile-main">

          {/* PROFILE HEADER */}
          <div className="profile-header">
            <div className="avatar-wrapper">
              <div className="avatar-circle">{initials}</div>
            </div>

            <div className="profile-info">
              <div className="profile-username-row">
                <span className="profile-username">{profile.name}</span>
                <button
                  className={`edit-profile-btn ${editing ? "active" : ""}`}
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? "Done" : "Edit profile"}
                </button>
              </div>

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-number">0</span>
                  <span className="stat-label">posts</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{profile.followers || 0}</span>
                  <span className="stat-label">followers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{profile.following || 0}</span>
                  <span className="stat-label">following</span>
                </div>
              </div>

              {/* BIO */}
              <div className="profile-bio-section">
                {editing ? (
                  <>
                    <textarea
                      className="bio-edit-area"
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write something about yourself..."
                    />
                    <br />
                    <button className="bio-save-btn" onClick={handleSaveBio}>Save bio</button>
                  </>
                ) : (
                  profile.bio
                    ? <p className="profile-bio-text">{profile.bio}</p>
                    : <p className="bio-placeholder">No bio yet</p>
                )}
              </div>

              {/* INTERESTS */}
              <div className="interests-section">
                <span className="interests-label">Interests</span>
                <div className="interests-tags">
                  {(profile.interests || []).map((interest, i) => (
                    <span key={i} className={`interest-tag ${editing ? "editable" : ""}`}>
                      {interest}
                      {editing && (
                        <button className="remove-tag-btn" onClick={() => handleRemoveInterest(interest)}>×</button>
                      )}
                    </span>
                  ))}
                  {(!profile.interests || profile.interests.length === 0) && !editing && (
                    <span style={{ fontSize: "13px", color: "#aaa", fontStyle: "italic" }}>No interests added yet</span>
                  )}
                </div>
                {editing && (
                  <div className="add-interest-row">
                    <input
                      className="interest-input"
                      type="text"
                      placeholder="e.g. Photography"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddInterest()}
                    />
                    <button className="add-interest-btn" onClick={handleAddInterest}>Add</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* POSTS SECTION */}
          <div className="posts-section">
            <div className="posts-tabs">
              <div className="posts-tab active">Posts</div>
            </div>
            <div className="posts-grid">
              <div className="empty-posts">
                <div className="empty-posts-icon">📷</div>
                <p>No posts yet</p>
              </div>
            </div>
          </div>

        </div>

        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}

export default Profile;