import React, { useState, useEffect } from "react";
import api from "../api"; // Make sure to import your API client

// 1. GradientBar function
function GradientBar({ score }) {
  const clamped = Math.max(1, Math.min(score || 5, 10));
  const percentage = ((clamped - 1) / 9) * 100; // 1–10 mapped to 0–100%

  return (
    <div
      style={{
        position: "relative",
        height: "10px",
        width: "100%",
        borderRadius: "8px",
        background: "linear-gradient(to right, red, orange, yellow, green)",
        marginBottom: "15px",
      }}
    >
      {/* Marker */}
      <div
        style={{
          position: "absolute",
          top: "-4px",
          left: `calc(${percentage}% - 5px)`,
          width: "10px",
          height: "10px",
          background: "#fff",
          borderRadius: "50%",
          border: "2px solid #333",
          boxShadow: "0 0 4px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  );
}

// 2. Emoji helper
function getEmojiFromScore(score) {
  const s = Math.max(1, Math.min(score || 5, 10));
  if (s <= 2) return "😭";
  if (s === 3) return "😢";
  if (s === 4) return "🙁";
  if (s === 5) return "😐";
  if (s === 6) return "�";
  if (s === 7) return "😊";
  if (s === 8) return "😄";
  if (s === 9) return "😃";
  return "🤩";
}

// 3. New improved pastel gradient background
function getMoodBackground(score) {
  if (!score) return "#fff";
  const clamped = Math.max(1, Math.min(score, 10));

  // HSL: 0 = red, 60 = yellow, 120 = green
  const hue =
    clamped <= 5
      ? 0 + ((clamped - 1) / 4) * 60
      : 60 + ((clamped - 5) / 5) * 60;

  // Create a soft gradient with white fade
  return `linear-gradient(135deg, hsl(${hue}, 80%, 85%) 0%, hsl(${hue}, 80%, 92%) 100%)`;
}

// Global streak and badges component
function GlobalStreakAndBadges({ entries }) {
  // Get max streak from entries
  const maxStreak = entries.reduce((max, e) => Math.max(max, e.streak || 0), 0);

  // Collect all badges across entries and remove duplicates
  const allBadges = entries.flatMap((e) => e.badges || []);
  const uniqueBadges = [...new Set(allBadges)];

  if (maxStreak === 0 && uniqueBadges.length === 0) return null;

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "15px",
        backgroundColor: "#fff3e0",
        borderRadius: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap",
        fontFamily: "cursive",
      }}
    >
      {maxStreak > 1 && (
        <span
          style={{
            fontWeight: "bold",
            fontSize: "1.2rem",
            color: "#ff5733",
            whiteSpace: "nowrap",
          }}
        >
          🔥 {maxStreak}-day streak
        </span>
      )}
      {uniqueBadges.length > 0 && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {uniqueBadges.map((badge, idx) => (
            <span key={idx} style={styles.badge}>
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  // Correctly get the user's email from the JWT token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsDataLoading(false);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // Use the email for identification, just like Dashboard.js
      setUserEmail(payload.email);
    } catch (err) {
      console.error("Error decoding token:", err);
      setIsDataLoading(false);
    }
  }, []);

  const fetchEntries = async (email) => {
    if (!email) {
      console.warn("User email is missing. Cannot fetch journal entries.");
      setIsDataLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/journal/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(res.data);
    } catch (err) {
      console.error("Error fetching entries:", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchEntries(userEmail);
    }
  }, [userEmail]);

  const handleSubmit = async () => {
    if (!content.trim() || !userEmail) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/journal",
        { userId: userEmail, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEntries(userEmail);
      setContent("");
    } catch (err) {
      console.error("Error submitting entry:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/journal/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries((prev) => prev.filter((entry) => entry._id !== id));
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  if (isDataLoading) {
    return <div style={{...styles.container, textAlign: "center"}}>Loading journal entries...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📖 My Journal</h2>
      {!userEmail && (
        <div style={styles.notLoggedIn}>
          Please log in to view your journal entries.
        </div>
      )}

      <div style={styles.entryBox}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Dear Diary... Write your thoughts here 💌"
          style={styles.textarea}
        />
        <button style={styles.button} onClick={handleSubmit} disabled={loading || !userEmail}>
          {loading ? "Saving..." : "Save Entry ✨"}
        </button>
      </div>

      <GlobalStreakAndBadges entries={entries} />

      <div style={styles.entriesList}>
        {entries.length > 0 ? (
          entries.map((entry) => (
            <div
              key={entry._id}
              style={{
                ...styles.entryCard,
                background: getMoodBackground(entry.sentimentScore),
              }}
            >
              <GradientBar score={entry.sentimentScore} />

              <div style={styles.entryHeader}>
                <div>
                  <span style={styles.moodEmoji}>{getEmojiFromScore(entry.sentimentScore)}</span>
                  <span style={styles.date}> {new Date(entry.createdAt).toLocaleDateString()}</span>
                </div>

                <button style={styles.deleteButton} onClick={() => handleDelete(entry._id)}>
                  ❌
                </button>
              </div>
              <p style={styles.entryContent}>{entry.content}</p>
            </div>
          ))
        ) : (
          userEmail && <div style={{...styles.entryBox, textAlign: "center"}}>No journal entries found. Start writing!</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "20px auto",
    padding: "20px",
    fontFamily: "cursive",
    color: "#333",
    backgroundColor: "#F4F0FA",
  },
  heading: {
    textAlign: "center",
    fontSize: "2rem",
    marginBottom: "20px",
  },
  entryBox: {
    background: "#fff8f0",
    border: "2px solid #ffd7ba",
    borderRadius: "15px",
    padding: "15px",
    marginBottom: "25px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  textarea: {
    width: "100%",
    height: "120px",
    border: "none",
    outline: "none",
    fontSize: "1rem",
    background: "transparent",
    resize: "none",
    fontFamily: "inherit",
    padding: "10px",
  },
  button: {
    marginTop: "10px",
    padding: "8px 16px",
    border: "none",
    background: "#ffa94d",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "bold",
    borderRadius: "10px",
    cursor: "pointer",
  },
  entriesList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  entryCard: {
    border: "1px solid #fcc2d7",
    borderRadius: "15px",
    padding: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "background 0.8s ease",
  },
  entryHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontWeight: "bold",
  },
  deleteButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "1.2rem",
  },
  moodEmoji: {
    fontSize: "1.5rem",
  },
  date: {
    fontSize: "0.9rem",
    color: "#555",
  },
  entryContent: {
    fontSize: "1.1rem",
    whiteSpace: "pre-line",
  },
  notLoggedIn: {
    padding: "20px",
    background: "#f8d7da",
    color: "#721c24",
    borderRadius: "10px",
    textAlign: "center",
    marginBottom: "25px",
    border: "1px solid #f5c6cb",
    fontSize: "1rem",
  },
  badge: {
    background: "#ffe066",
    padding: "2px 6px",
    borderRadius: "8px",
    fontSize: "0.8rem",
    fontWeight: "bold",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
};



