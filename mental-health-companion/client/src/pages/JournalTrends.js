import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Convert score to emoji
function getEmojiFromScore(score) {
  const s = Math.max(1, Math.min(score || 5, 10));
  if (s <= 2) return "😭";
  if (s === 3) return "😢";
  if (s === 4) return "🙁";
  if (s === 5) return "😐";
  if (s === 6) return "🙂";
  if (s === 7) return "😊";
  if (s === 8) return "😄";
  if (s === 9) return "😃";
  return "🤩";
}

export default function JournalTrends() {
  const [data, setData] = useState([]);
  const userId = "Kavya123"; // replace later with logged-in user ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/journal/${userId}`);
        const entries = await res.json();

        const chartData = entries
          .map((entry) => ({
            date: new Date(entry.createdAt).toLocaleDateString(),
            sentiment: entry.sentimentScore,
          }))
          .reverse();

        setData(chartData);
      } catch (err) {
        console.error("Error fetching journal data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Mood Trends Over Time
      </h2>

      {data.length === 0 ? (
        <p style={{ textAlign: "center" }}>No journal data to display.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              type="number"
              domain={[1, 10]}
              ticks={[1,2,3,4,5,6,7,8,9,10]}
              tickFormatter={(tick) => getEmojiFromScore(Math.round(tick))}
            />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="#8884d8"
              strokeWidth={3}
              dot={{ r: 6 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}




