import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {

  // Permitir CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { blocks } = req.body;

    if (!blocks || !Array.isArray(blocks)) {
      return res.status(400).json({ error: "Invalid blocks format" });
    }

    // Junta todos os textos numerados
    const numberedText = blocks
      .map((b, i) => `${i + 1}. ${b.text}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Translate the numbered sentences to Portuguese. Return JSON with format: { translations: [ { index: number, translated_text: string } ] }"
        },
        {
          role: "user",
          content: numberedText
        }
      ],
    });

    const answer = completion.choices[0].message.content;

    let parsed;

    try {
      parsed = JSON.parse(answer);
    } catch (err) {
      console.error("Invalid JSON from model:", answer);
      return res.status(500).json({
        error: "Model returned invalid JSON",
        raw: answer
      });
    }

    if (!parsed.translations || !Array.isArray(parsed.translations)) {
      return res.status(500).json({
        error: "Unexpected response structure",
        raw: parsed
      });
    }

    // Mapear tradução para os blocos originais
    const translatedBlocks = blocks.map((block, i) => {
      const match = parsed.translations.find(t => t.index === i + 1);

      return {
        ...block,
        translated_text: match ? match.translated_text : block.text
      };
    });

    return res.status(200).json({
      blocks: translatedBlocks
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
