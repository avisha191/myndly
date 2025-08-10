import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function MoodChart({ entries, period }) {
  const moodToValue = { sad: 1, okay: 2, neutral: 2, happy: 3, angry: 4 };

  // Normalize mood text (removes emojis, trims spaces, lowercase)
  const cleanMood = (mood) =>
  (mood || "")
    .replace(/[^a-zA-Z]+/g, "") // removes emojis & special chars reliably
    .trim()
    .toLowerCase();

  const days = period === "weekly" ? 7 : 30;

  const filtered = entries.slice(0, days).reverse();

  const data = filtered.map((entry) => {
    const moodKey = cleanMood(entry.mood || entry.moodType);
    return {
      date: new Date(entry.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      moodValue: moodToValue[moodKey] ?? 2, // numeric for Y-axis
      moodLabel:
        moodKey.charAt(0).toUpperCase() + moodKey.slice(1) || "Okay", // text for tooltip
    };
  });

  const moodLabel = (val) =>
    val === 1
      ? "Sad"
      : val === 2
      ? "Okay"
      : val === 3
      ? "Happy"
      : "";

  return (
    <div style={{ background: "#fff", padding: "10px", borderRadius: "12px" }}>
      <h3 style={{ textAlign: "center" }}>
        Mood Trend ({period === "weekly" ? "Last 7 Days" : "Last 30 Days"})
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            domain={[0, 4]}
            ticks={[1, 2, 3]}
            tickFormatter={moodLabel}
          />
          <Tooltip
  formatter={(value, name, props) => [
    props.payload.moodLabel,
    "Mood",
  ]}
/>
          <Line
            type="monotone"
            dataKey="moodValue"
            stroke="#6C63FF"
            strokeWidth={3}
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}




