import axios from "axios";

const API = "http://localhost:5001/api";

export const createPost = async (postData) => {
  try {
    const res = await axios.post(`${API}/posts`, postData);
    return res.data;
  } catch (err) {
    console.error("Error creating post:", err);
    throw err;
  }
};