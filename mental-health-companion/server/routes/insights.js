const express = require("express");
const Journal = require("../models/Journal");
const OpenAI = require("openai");

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.get("/:userId", async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get entries from last 7 days
    const entries = await Journal.find({
      userId: req.params.userId,
      createdAt: { $gte: oneWeekAgo },
    }).sort({ createdAt: -1 });

    if (entries.length === 0) {
      return res.json({ summary: "No entries in the last 7 days." });
    }

    const combinedText = entries.map(e => e.content).join("\n");

    const prompt = `You are a mood analysis assistant.
Analyze the following journal entries from the last 7 days and respond in 2 short lines:
1. Overall mood trend (happy, sad, neutral)
2. Key recurring themes (like stress, exams, family, motivation)
3. A practical, encouraging recommendation based on the mood (for example, if sad, suggest activities or habits to improve mood)\n\n${combinedText}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const summary = completion.choices[0].message.content;
    res.json({ summary });
  } catch (err) {
    console.error("Error generating insights:", err.message);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

module.exports = router;

