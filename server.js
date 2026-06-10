import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

console.log("API key loaded:", process.env.OPENAI_API_KEY ? "YES" : "NO");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate-report", async (req, res) => {
  console.log("Beiðni kom inn í /generate-report");

  try {
    const {
      name,
      age,
      team,
      season,
      sport,
      position,
      games,
      goals,
      strengths,
      weaknesses,
    } = req.body;

    const prompt = `
Skrifaðu faglega íþróttaskýrslu á íslensku.

Upplýsingar:
- Nafn: ${name}
- Aldur: ${age}
- Lið: ${team}
- Tímabil: ${season}
- Íþrótt: ${sport}
- Staða: ${position}
- Leikir: ${games}
- Mörk/Stig: ${goals}
- Styrkleikar: ${strengths}
- Atriði til að bæta: ${weaknesses}

Skrifaðu 1-2 málsgreinar.
Hafðu skýrsluna gagnlega fyrir þjálfara.
Nefndu hvað leikmaðurinn gerir vel og hvað hann ætti að bæta.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 350,
    });

    const report = response.choices[0].message.content;

    res.json({ report });
  } catch (error) {
    console.error("OPENAI ERROR:");
    console.error(error);

    res.status(500).json({
      error: "Villa kom upp við að búa til skýrslu.",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server keyrir á port ${PORT}`);
});