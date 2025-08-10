const express = require("express");
const Mood = require("../models/Mood");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { moodType, notes } = req.body;
    const userEmail = req.user.email;
    const mood = await Mood.create({ userEmail, moodType, notes });
    res.status(201).json(mood);
  } catch (err) {
    res.status(500).json({ message: "Error saving mood", error: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const moods = await Mood.find({ userEmail }).sort({ createdAt: -1 });
    res.json(moods);
  } catch (err) {
    res.status(500).json({ message: "Error fetching moods", error: err.message });
  }
});

module.exports = router;


