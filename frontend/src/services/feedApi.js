import axios from "axios";

const API = "http://localhost:5001/api";

export const getFeed = async () => {
  try {
    const res = await axios.get(`${API}/feed`);
    return res.data;
  } catch (err) {
    console.error("Error fetching feed:", err);
    return [];
  }
};