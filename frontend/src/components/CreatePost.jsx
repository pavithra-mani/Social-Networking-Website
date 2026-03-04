import { useState } from "react"

const CreatePost = ({ onCreate }) => {
  const [content, setContent] = useState("")
  const [image, setImage] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setImage(imageUrl)
    }
  }

  const handleSubmit = () => {
    if (!content.trim() && !image) return

    const newPost = {
      id: Date.now().toString(),
      content,
      imageUrl: image,
      timestamp: new Date().toISOString(),
      author: {
        uid: "1",
        name: "Arunank",
        isFollowing: false
      },
      likeCount: 0,
      isLiked: false
    }

    onCreate(newPost)
    setContent("")
    setImage(null)
  }

  return (
    <div style={styles.container}>
      <textarea
        placeholder="Share something..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={styles.textarea}
      />

      <input type="file" accept="image/*" onChange={handleImageChange} />

      {image && (
        <img src={image} alt="preview" style={styles.preview} />
      )}

      <button onClick={handleSubmit} style={styles.button}>
        Post
      </button>
    </div>
  )
}

const styles = {
  container: {
    background: "#1f1f1f",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    marginBottom: "10px"
  },
  preview: {
    width: "100%",
    marginTop: "10px",
    borderRadius: "8px"
  },
  button: {
    marginTop: "10px",
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#22c55e",
    color: "white"
  }
}

export default CreatePost