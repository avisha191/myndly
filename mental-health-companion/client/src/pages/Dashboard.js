import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

/**
 * MoodChart component to display a line chart of mood trends based on sentiment scores.
 * The data for this chart is now derived solely from the user's journal entries' sentimentScore.
 */
const MoodChart = ({ entries, period }) => {

  // A helper function to create a descriptive label from the sentiment score
  const getSentimentLabel = (score) => {
    // Clamping the score to be within the 1-10 range
    const clampedScore = Math.max(1, Math.min(score, 10));
    
    if (clampedScore > 8) return "Very Positive";
    if (clampedScore > 6) return "Positive";
    if (clampedScore > 4) return "Neutral";
    if (clampedScore > 2) return "Negative";
    if (clampedScore > 0) return "Very Negative";
    return "Neutral"; // Default to neutral if somehow the score is 0 or less
  };

  // Determine the number of days to show based on the 'period' prop
  const days = period === "weekly" ? 7 : 30;

  // Slice the most recent entries and reverse them to show in chronological order
  const filtered = entries.slice(0, days).reverse();

  // Format the data for the Recharts library, using sentimentScore directly
  const data = filtered.map((entry) => {
    // Use the sentimentScore from the entry, or a default value of 5 (neutral) if missing
    const sentimentScore = entry.sentimentScore || 5; 
    return {
      date: new Date(entry.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      // The moodValue is now the sentiment score itself
      moodValue: sentimentScore,
    };
  });

  // A formatter function for the Y-axis to show descriptive labels for key ticks
  const yAxisTickFormatter = (val) => {
    if (val === 1) return "Very Negative";
    if (val === 5) return "Neutral";
    if (val === 10) return "Very Positive";
    return "";
  };

  return (
    <div style={{ background: "#fff", padding: "10px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
      <h3 style={{ textAlign: "center", marginBottom: "15px" }}>
        Mood Trend ({period === "weekly" ? "Last 7 Days" : "Last 30 Days"})
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" />
          <YAxis
            domain={[0.5, 10.5]} // Set domain to cover the 1-10 sentiment score range
            ticks={[1, 5, 10]} // Use a few key ticks for clarity
            tickFormatter={yAxisTickFormatter}
            allowDecimals={false}
          />
          
          <Line
            type="monotone"
            dataKey="moodValue"
            stroke="#6C63FF"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
      {data.length === 0 && (
        <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
          No mood data to display for the selected period.
        </div>
      )}
    </div>
  );
};


export default function Dashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [period, setPeriod] = useState("weekly");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  
  const [entries, setEntries] = useState([]);
  const [progress, setProgress] = useState({ streakCount: 0, badges: [] });
  const [newBadge, setNewBadge] = useState(null);
  
  const navigate = useNavigate();

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/journal/${userEmail || "anonymous"}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(res.data);
    } catch (err) {
      console.error("Error fetching entries", err);
    }
  };
  
  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/user/${userEmail}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgress(res.data);
    } catch (err) {
      console.error("Error fetching progress", err);
    }
  };

  // Decode token for email and set userEmail
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserEmail(payload.email);
    } catch {
      console.log("Couldn't decode token");
    }
  }, []);

  // Fetch data only after userEmail is set
  useEffect(() => {
    if (userEmail) {
      fetchEntries();
      fetchProgress();
    }
  }, [userEmail]);
  
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const quotes = [
    "Breathe. You are stronger than you think.",
    "One step at a time. You got this!",
    "Be kind to yourself today.",
    "Your mind matters. Take a pause.",
    "Healing takes time, and that’s perfectly okay.",
    "Small steps every day lead to big changes.",
    "Your feelings are valid. Always.",
    "You deserve rest, not just productivity.",
    "Even slow progress is progress.",
    "Be proud of how far you’ve come.",
    "You are enough just as you are.",
    "Storms don’t last forever; brighter days are coming.",
    "Choose kindness, especially towards yourself.",
    "Take a deep breath—you are safe right now.",
    "Your story is still being written.",
    "Happiness is found in small, simple moments.",
    "You have survived 100% of your toughest days.",
    "Give yourself permission to just be.",
    "It’s okay to ask for help—you are not alone.",
    "Celebrate the little victories today.",
  ];

  const dailyQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const theme = darkMode
    ? {
        background: "linear-gradient(135deg, #232526 0%, #414345 100%)",
        card: "rgba(30,30,30,0.9)",
        text: "#f1f1f1",
        subText: "#cccccc",
        cardBg: "#333",
        buttonBg: "#6C63FF",
      }
    : {
        background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        card: "rgba(255,255,255,0.9)",
        text: "#333",
        subText: "#666",
        cardBg: "#f1f1ff",
        buttonBg: "#6C63FF",
      };

  return (
    <div style={{ ...styles.container, background: theme.background }}>
      <div style={{ ...styles.dashboard, background: theme.card }}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <button
            style={{
              ...styles.toggleButton,
              background: theme.buttonBg,
              color: "#fff",
            }}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            style={{
              ...styles.toggleButton,
              background: "#ff4d4d",
              color: "#fff",
              marginLeft: "10px",
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <h1 style={{ ...styles.title, color: theme.text }}>
          Hi {userEmail ? userEmail.split("@")[0] : "Friend"} 🌱
        </h1>
        <p style={{ ...styles.subtitle, color: theme.subText }}>
          Here’s your mindful space today
        </p>

        {/* Daily Quote */}
        <div
          style={{
            ...styles.quoteCard,
            background: theme.cardBg,
            color: theme.text,
          }}
        >
          <p style={styles.quote}>{dailyQuote}</p>
        </div>

        {/* This section for mood selection is now removed */}

        {/* Mood Chart */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <button
              style={{
                ...styles.toggleButton,
                background: period === "weekly" ? theme.buttonBg : "#ccc",
                color: "#fff",
                marginRight: "10px",
              }}
              onClick={() => setPeriod("weekly")}
            >
              Weekly
            </button>
            <button
              style={{
                ...styles.toggleButton,
                background: period === "monthly" ? theme.buttonBg : "#ccc",
                color: "#fff",
              }}
              onClick={() => setPeriod("monthly")}
            >
              Monthly
            </button>
          </div>
          <MoodChart entries={entries} period={period} />
        </div>

        {/* Quick Links */}
        <div style={styles.links}>
          <button
            style={{ ...styles.linkButton, background: theme.buttonBg }}
            onClick={() => navigate("/journal")}
          >
            ✏️ Journal
          </button>
          <button
            style={{ ...styles.linkButton, background: theme.buttonBg }}
            onClick={() => navigate("/chatbot")}
          >
            🤖 AI Chatbot
          </button>
          <button
            style={{ ...styles.linkButton, background: theme.buttonBg }}
            onClick={() => navigate("/insights")}
          >
            🧠 Insights
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "30px",
    fontFamily: "'Poppins', sans-serif",
    transition: "0.4s ease",
  },
  dashboard: {
    maxWidth: "800px",
    margin: "0 auto",
    borderRadius: "20px",
    padding: "2rem",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    backdropFilter: "blur(6px)",
    transition: "0.4s ease",
  },
  topBar: {
    textAlign: "right",
    marginBottom: "10px",
  },
  title: { fontSize: "2rem", fontWeight: "bold", marginBottom: "0.3rem" },
  subtitle: { fontSize: "1.1rem", marginBottom: "1.5rem" },
  quoteCard: {
    borderRadius: "12px",
    padding: "1rem",
    marginBottom: "1.5rem",
    textAlign: "center",
    fontStyle: "italic",
    transition: "0.4s ease",
  },
  quote: { fontSize: "1.2rem" },
  section: { marginBottom: "2rem" },
  sectionTitle: { fontSize: "1.3rem", marginBottom: "1rem" },
  moodGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "10px",
  },
  moodButton: {
    padding: "0.7rem",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "0.3s",
  },
  links: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "1.5rem",
  },
  linkButton: {
    padding: "0.8rem 1.5rem",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    textDecoration: "none",
    textAlign: "center",
    fontWeight: "bold",
    cursor: "pointer",
    flex: "1",
  },
  toggleButton: {
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    border: "none",
    fontSize: "0.9rem",
  },
};



