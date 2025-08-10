import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

// CHANGE THIS LINK to your preferred calming background image
const backgroundURL = "https://m.zenmix.io/cbi/l/relaxing-background-image-29.png";

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Signup
      await api.post("/auth/signup", form);

      // Immediately log in after signup
      const loginRes = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      // Save token in localStorage
      localStorage.setItem("token", loginRes.data.token);
      // >>> ADD THIS LINE <<<
      localStorage.setItem("userId", loginRes.data.userId);
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Error signing up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Your Space</h2>
        <p style={styles.subtitle}>Join Myndly – A calm place for your mind</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
        <p style={styles.footer}>
          Already have an account?{" "}
          <a href="/login" style={styles.link}>Login</a>
        </p>
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: "100vh",

    // ↓↓↓ THIS IS THE LINE TO CHANGE FOR BACKGROUND IMAGE ↓↓↓
    backgroundImage: `url(${backgroundURL})`, // change link above to switch background
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Poppins', sans-serif",
  },

  card: {
    // White box with transparency
    background: "rgba(255, 255, 255, 0.9)",
    padding: "2.5rem",
    borderRadius: "18px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
    width: "380px",
    textAlign: "center",
    backdropFilter: "blur(8px)",
  },
  title: {
    marginBottom: "0.5rem",
    fontSize: "2rem",
    color: "#333",
    fontWeight: "bold",
  },
  subtitle: {
    marginBottom: "1.5rem",
    fontSize: "1rem",
    color: "#666",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.8rem",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    outline: "none",
    transition: "0.3s",
  },
  button: {
    padding: "0.8rem",
    background: "#6C63FF",
    color: "#fff",
    fontSize: "1rem",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  footer: {
    marginTop: "1.2rem",
    fontSize: "0.9rem",
    color: "#555",
  },
  link: {
    color: "#6C63FF",
    textDecoration: "none",
    fontWeight: "bold",
  },
};


