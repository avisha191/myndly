const express = require("express");
const Journal = require("../models/Journal");
const Groq = require("groq-sdk");
require("dotenv").config();

const router = express.Router();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.get("/:userId", async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get last 7 days journal entries
    const entries = await Journal.find({
      userId: req.params.userId,
      createdAt: { $gte: oneWeekAgo },
    }).sort({ createdAt: -1 });

    if (entries.length === 0) {
      return res.json({
        summary: "No journal entries in the last 7 days.",
      });
    }

    const combinedText = entries
      .map((entry) => entry.content)
      .join("\n");

    const prompt = `
You are a mental wellness assistant.

Analyze the following journal entries from the last 7 days.

Return:
1. Overall mood trend
2. Common themes
3. A short encouraging recommendation

Journal Entries:
${combinedText}
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

    const summary = completion.choices[0].message.content;

    res.json({ summary });

  } catch (err) {
    console.error("Groq Error:", err.message);

    res.status(500).json({
      error: "Failed to generate insights",
    });
  }
});

module.exports = router;

