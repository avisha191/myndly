import axios from "axios";

// Access the environment variable correctly.
// Create React App projects use 'process.env' and a 'REACT_APP_' prefix.
const baseURL = process.env.REACT_APP_API_URL;

// Create an Axios instance with the base URL from the environment variable.
const api = axios.create({
  baseURL,
});

export default api;
