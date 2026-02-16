import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {

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
      return res.status(400).json({ error: "No blocks provided" });
    }

    const texts = blocks.map(b => b.text).join("\n---\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
Translate the following text blocks to Portuguese.
Return ONLY a JSON array of translated texts in the same order.
`
        },
        {
          role: "user",
          content: texts
        }
      ]
    });

    const raw = response.choices[0].message.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const translations = JSON.parse(raw);

    const result = blocks.map((block, i) => ({
      translated_text: translations[i],
      x: block.x,
      y: block.y,
      width: block.width,
      height: block.height
    }));

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Translation failed" });
  }
}
