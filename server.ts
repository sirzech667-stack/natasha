import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to get Gemini client lazily
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// AI API Endpoints
app.post("/api/ai/synopsis", async (req, res) => {
  try {
    const { title, genre, keywords, length, language } = req.body;
    const ai = getGenAI();
    if (!ai) {
      return res.status(400).json({ error: "GEMINI_API_KEY is not configured." });
    }

    const langName = language || "Indonesian";
    const prompt = `You are a professional book editor and creative writing consultant for the novel studio platform 'Natasha'.
Generate a compelling ${length === "short" ? "short logline synopsis (100-150 words)" : "detailed synopsis with premise, conflict, and character arc (250-400 words)"} for a novel.
Title: ${title || "Untitled"}
Genre: ${genre || "General Fiction"}
Keywords / Premise: ${keywords || "A compelling story about destiny and choices."}
Language: Write the entire response in ${langName}.
Keep it captivating, polished, and suitable for a published book blurb. Do not include markdown code block quotes, just the clean formatted synopsis text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ synopsis: response.text || "" });
  } catch (error: any) {
    console.error("AI Synopsis Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate synopsis" });
  }
});

app.post("/api/ai/brainstorm", async (req, res) => {
  try {
    const { type, topic, context, language } = req.body;
    const ai = getGenAI();
    if (!ai) {
      return res.status(400).json({ error: "GEMINI_API_KEY is not configured." });
    }

    const langName = language || "Indonesian";
    const prompt = `You are an expert novelist story architect.
Topic/Goal: ${topic}
Type: ${type || "plot_twist"} (Options: plot_twist, character_idea, worldbuilding, chapter_outline, scene_starter)
Context: ${context || "None provided"}
Language: Respond in ${langName}.

Provide 3-5 creative, inspiring, and structured ideas or options with bullet points and brief descriptions. Format clearly with clean headers or bullet points.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ ideas: response.text || "" });
  } catch (error: any) {
    console.error("AI Brainstorm Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate ideas" });
  }
});

app.post("/api/ai/enhance", async (req, res) => {
  try {
    const { text, mode, language } = req.body;
    const ai = getGenAI();
    if (!ai) {
      return res.status(400).json({ error: "GEMINI_API_KEY is not configured." });
    }

    const langName = language || "Indonesian";
    let actionInstruction = "Enhance readability and prose flow while maintaining tone.";
    if (mode === "describe") actionInstruction = "Expand descriptions with vivid sensory details (sight, sound, atmosphere).";
    if (mode === "dialogue") actionInstruction = "Polish dialogue to make it sound natural, expressive, and distinct.";
    if (mode === "fix") actionInstruction = "Fix grammar, spelling, and awkward phrasing while preserving exact meaning.";

    const prompt = `You are a prose polishing assistant for novelists.
Instruction: ${actionInstruction}
Language: ${langName}

Original Text:
"${text}"

Provide ONLY the enhanced text output without preamble or commentary.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ enhancedText: response.text || text });
  } catch (error: any) {
    console.error("AI Enhance Error:", error);
    res.status(500).json({ error: error.message || "Failed to enhance text" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Natasha Novel Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
