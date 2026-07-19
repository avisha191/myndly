const express = require("express");
const Journal = require("../models/Journal");
const Groq = require("groq-sdk");
require("dotenv").config();

const router = express.Router();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Convert score to mood label
function getMoodFromScore(score) {
  if (score >= 8) return "happy";
  if (score <= 4) return "sad";
  return "neutral";
}

// POST /api/journal - Add journal entry with AI sentiment
router.post("/", async (req, res) => {
  const { userId, content } = req.body;

  if (!userId || !content) {
    return res.status(400).json({
      error: "userId and content are required",
    });
  }

  let sentimentScore = 5;
  let mood = "neutral";

  // AI Sentiment Analysis using Groq
  try {
    const prompt = `
Rate the sentiment of this journal entry on a scale from 1 to 10.

1 = Very Negative
10 = Very Positive

Reply ONLY with the number.

Journal:
${content}
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const raw = completion.choices[0].message.content.trim();

    sentimentScore = Math.max(
      1,
      Math.min(10, parseFloat(raw))
    );

    if (isNaN(sentimentScore)) sentimentScore = 5;

    mood = getMoodFromScore(sentimentScore);

  } catch (err) {
    console.error("Groq API Error:", err.message);
  }

  try {
    const lastEntry = await Journal.findOne({ userId }).sort({
      createdAt: -1,
    });

    let streak = 1;
    let badges = [];

    const today = new Date().setHours(0, 0, 0, 0);

    if (lastEntry) {
      const lastDate = new Date(lastEntry.createdAt).setHours(
        0,
        0,
        0,
        0
      );

      const diffDays =
        (today - lastDate) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        streak = (lastEntry.streak || 1) + 1;
      } else if (diffDays === 0) {
        streak = lastEntry.streak || 1;
      }
    }

    const totalEntries = await Journal.countDocuments({
      userId,
    });

    const newTotal = totalEntries + 1;

    // Badges
    if (newTotal === 1) badges.push("First Entry ✨");
    if (newTotal === 5) badges.push("5 Entries 📔");
    if (newTotal === 10) badges.push("10 Entries 📚");

    if (streak === 1) badges.push("1-Day Streak 🔥");
    if (streak === 7) badges.push("1-Week Streak 🔥🔥");
    if (streak === 14) badges.push("14-Day Streak 🏅");
    if (streak === 21) badges.push("21-Day Streak 🏆");
    if (streak === 25) badges.push("25-Day Streak 🎉");
    if (streak === 50) badges.push("50-Day Streak 🎖️");
    if (streak === 100) badges.push("75-Day Streak 🥇");
    if (streak === 180) badges.push("180-Day Streak 👑");
    if (streak === 365) badges.push("365-Day Streak 🏆👑");

    if (sentimentScore >= 9)
      badges.push("Positive Vibes 😄");

    if (streak >= 7)
      badges.push("Consistency Champ 🏆");

    const newEntry = await Journal.create({
      userId,
      content,
      mood,
      sentimentScore,
      streak,
      badges,
    });

    res.status(201).json(newEntry);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to save journal entry",
    });
  }
});

// GET Journal Entries
router.get("/:userId", async (req, res) => {
  try {
    const entries = await Journal.find({
      userId: req.params.userId,
    }).sort({
      createdAt: -1,
    });

    res.json(entries);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch entries",
    });
  }
});

// DELETE Entry
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Journal.findByIdAndDelete(
      req.params.id
    );

    if (!deleted) {
      return res.status(404).json({
        error: "Entry not found",
      });
    }

    res.json({
      message: "Entry deleted",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to delete entry",
    });
  }
});

module.exports = router;

