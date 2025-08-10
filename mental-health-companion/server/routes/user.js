const express = require("express");
const User = require("../models/User");

const router = express.Router();

// GET /api/user/:email/progress
router.get("/:email/progress", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      streakCount: user.streakCount || 0,
      badges: user.badges || [],
    });
  } catch (err) {
    console.error("Error fetching progress:", err.message);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

module.exports = router;
