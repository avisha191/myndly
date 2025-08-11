import axios from "axios";

// Use a conditional check to set the base URL.
// In a development environment, it will use your localhost URL.
// In a production environment (like on Vercel), it will use the
// environment variable you set, which should point to your backend.
const baseURL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_BACKEND_URL
  : "http://localhost:5000/api";

const api = axios.create({
  baseURL: baseURL,
});

export default api;