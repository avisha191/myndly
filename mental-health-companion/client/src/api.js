import axios from "axios";

// Use the Vercel environment variable for the backend URL, with a local fallback
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: baseURL,
});

export default api;
