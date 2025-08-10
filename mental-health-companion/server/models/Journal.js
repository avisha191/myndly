// models/Journal.js
const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  content: { type: String, required: true },
  mood: { type: String, enum: ["happy", "neutral", "sad"], default: "neutral" },
  sentimentScore: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now },
  streak: { type: Number, default: 1 },
  badges: [{ type: String }]
});

module.exports = mongoose.model("Journal", journalSchema);
