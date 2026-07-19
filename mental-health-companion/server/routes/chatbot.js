const express = require("express");
const Groq = require("groq-sdk");
require("dotenv").config();

const router = express.Router();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const GROQ_MODEL = "llama-3.1-8b-instant"; // updated Groq model name

router.post("/", async (req, res) => {
  const { message } = req.body;
  console.log("Message from frontend:", message);

  try {
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are a helpful and friendly AI assistant." },
        { role: "user", content: message }
      ],
    });

    const botReply = completion.choices[0].message.content;
    res.json({ reply: botReply });
  } catch (error) {
    console.error("Groq API Error:", error);
    res.status(500).json({ error: "Error communicating with AI" });
  }
});

module.exports = router;





