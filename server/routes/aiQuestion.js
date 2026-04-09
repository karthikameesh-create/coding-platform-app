const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/generate", async (req, res) => {
  try {
    const { topic, difficulty } = req.body;

    const prompt = `
Generate 5 quiz questions on topic "${topic}" with difficulty "${difficulty}".

Return ONLY valid JSON array like this:
[
  {
    "title": "Short title",
    "description": "Question text",
    "difficulty": "${difficulty}",
    "correctAnswer": "Answer"
  }
]
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    let text = response.choices[0].message.content;

    // 🔥 FIX JSON PARSING (VERY IMPORTANT)
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const questions = JSON.parse(text);

    res.json(questions);

  } catch (err) {
    console.error("AI ERROR:", err.message);
    res.status(500).json({ error: "AI generation failed" });
  }
});

module.exports = router;