import React, { useEffect, useState } from "react";

export default function JournalInsights() {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(true);
  const userId = "Kavya123"; // Replace with actual logged-in user ID

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/insights/${userId}`);
        const data = await res.json();
        setInsights(data.summary || "No insights available yet.");
      } catch (err) {
        console.error("Error fetching insights:", err);
        setInsights("Failed to load insights.");
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #dbeafe, #fef9c3)",
        padding: "40px 20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          animation: "fadeIn 0.8s ease",
        }}
      >
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
            <p
              style={{
                fontSize: "1.2rem",
                lineHeight: "1.6",
                whiteSpace: "pre-line",
                color: "#111827",
              }}
            >
              {insights}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



