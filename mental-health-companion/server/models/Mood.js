const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  moodType: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Mood", moodSchema);

