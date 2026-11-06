
const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.json({ limit: "8mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, app: "SHIV AI" });
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function askGemini(url, key, body) {
  let lastError = "";

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000)
      });

      const data = await response.json();

      if (response.ok) return data;

      lastError = data?.error?.message || `HTTP ${response.status}`;

      const retryable = [429, 500, 502, 503, 504].includes(response.status);

      if (!retryable || attempt === 3) {
        throw new Error(lastError);
      }
    } catch (error) {
      lastError = error.message || "Network error";

      if (attempt === 3) throw new Error(lastError);
    }

    await sleep(1000 * Math.pow(2, attempt - 1));
  }

  throw new Error(lastError || "AI service unavailable");
}

app.post("/api/ask", async (req, res) => {
  try {
    const {
      question,
      image,
      language = "Hindi",
      mode = "Student"
    } = req.body || {};

    if (!question && !image) {
      return res.status(400).json({
        error: "Please enter a question or attach an image."
      });
    }

    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured."
      });
    }

    const parts = [{
      text: `You are SHIV AI, a helpful and accurate educational and general assistant.
Mode: ${mode}.
Preferred language: ${language}.
Use simple, clear language.
For school and college problems, show steps and formulas.
Read attached images carefully.
If uncertain, say so.

User question: ${question || "Read and solve the attached image."}`
    }];

    if (image) {
      const match = String(image).match(
        /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i
      );

      if (!match) {
        return res.status(400).json({
          error: "Use JPEG, PNG or WebP image."
        });
      }

      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2]
        }
      });
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const data = await askGemini(url, key, {
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048
      }
    });

    const answer = (data.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || "")
      .join("")
      .trim();

    if (!answer) {
      return res.status(502).json({
        error: "AI returned no text. Please try again."
      });
    }

    return res.json({ answer });

  } catch (error) {
    console.error("SHIV AI error:", error.message);

    return res.status(502).json({
      error: "SHIV AI could not get an answer: " + error.message
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log("SHIV AI listening on " + port);
});
