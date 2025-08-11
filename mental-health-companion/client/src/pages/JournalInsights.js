import React, { useEffect, useState } from "react";
import api from "../api"; // Assuming 'api' is configured with your base URL

export default function JournalInsights() {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Consolidate the logic into a single useEffect hook
  useEffect(() => {
    // This function will handle both token retrieval and data fetching
    const fetchUserAndInsights = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        // If no token is found, stop loading and show the login message
        setLoading(false);
        setInsights("Please log in to view your weekly insights.");
        return;
      }
      
      let userEmail = null;
      try {
        // Decode the token to get the user's email
        const payload = JSON.parse(atob(token.split(".")[1]));
        userEmail = payload.email;
      } catch (err) {
        console.error("Error decoding token:", err);
        setLoading(false);
        setInsights("An error occurred with your session. Please log in again.");
        return;
      }
      
      // If we have an email, proceed with the API call
      if (userEmail) {
        try {
          const res = await api.get(`/insights/${userEmail}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setInsights(res.data.summary || "No insights available yet.");
        } catch (err) {
          console.error("Error fetching insights:", err);
          setInsights("Failed to load insights. Please check your network and try again.");
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback for cases where the token exists but the email can't be decoded
        setLoading(false);
        setInsights("An error occurred with your session. Please log in again.");
      }
    };
    
    fetchUserAndInsights();
  }, []); // Empty dependency array ensures this runs only once on mount

  const insightContainerStyle = {
    maxWidth: "700px",
    margin: "0 auto",
    background: "white",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    animation: "fadeIn 0.8s ease",
  };

  const insightTextStyle = {
    fontSize: "1.2rem",
    lineHeight: "1.6",
    whiteSpace: "pre-line",
    color: "#111827",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #dbeafe, #fef9c3)",
        padding: "40px 20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div style={insightContainerStyle}>
        <h2
          style={{
            textAlign: "center",
            fontSize: "2rem",
            marginBottom: "20px",
            color: "#374151",
          }}
        >
          🧠 Weekly Mood Insights
        </h2>

        {loading ? (
          <p
            style={{
              textAlign: "center",
              fontSize: "1.2rem",
              color: "#6b7280",
            }}
          >
            Analyzing your journal entries...
          </p>
        ) : (
          <div
            style={{
              background: "#f9fafb",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #e5e7eb",
            }}
          >
            <p style={insightTextStyle}>
              {insights}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



