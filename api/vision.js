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

    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 2000,
      messages: [
        {
          role: "system",
          content: `
You are an OCR + translation engine for manhwa.

Detect ALL text blocks.
Translate them to Portuguese.

Return ONLY valid JSON array:

[
  {
    "translated_text": "...",
    "x": number,
    "y": number,
    "width": number,
    "height": number
  }
]
`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ]
    });

    return res.status(200).json({
      result: response
    });

  } catch (error) {
    console.error("VISION ERROR:", error);
    return res.status(500).json({ error: "Vision request failed" });
  }
}
