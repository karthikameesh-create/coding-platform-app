const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generate", async (req, res) => {
  try {
    const { topic, difficulty, count } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
Generate ${count || 5} multiple choice quiz questions on "${topic}" with difficulty "${difficulty}".

Return ONLY JSON array:
[
  {
    "title": "Short title",
    "description": "Question",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A"
  }
]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json(JSON.parse(text));

  } catch (err) {
    console.error("--- GEMINI API ERROR ---", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;