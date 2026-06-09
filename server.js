import express from "express";
import cors from "cors";
import "dotenv/config";
import OpenAI from "openai";

const app = express();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

app.post("/generate-report", async (req, res) => {
  try {
    const { name, sport, games, goals, strengths, weaknesses } = req.body;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `Skrifaðu stutta íslenska íþróttaskýrslu fyrir leikmann.
Nafn: ${name}
Íþrótt: ${sport}
Leikir: ${games}
Mörk/Stig: ${goals}
Styrkleikar: ${strengths}
Veikleikar: ${weaknesses}

Hafðu þetta faglegt, einfalt og gagnlegt fyrir þjálfara.`,
    });

    res.json({ report: response.output_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Villa kom upp við að búa til skýrslu." });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server keyrir á port ${PORT}`);
});