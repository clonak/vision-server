import OpenAI from "openai";
import fetch from "node-fetch";

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
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Missing imageUrl" });
    }

    // Download imagem
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are translating dialogue from a manhua.

1. Detect all readable dialogue text in the image.
2. Group lines that belong to the same speech bubble.
3. Translate naturally into European Portuguese.
4. Do NOT translate literally.
5. Make it sound like natural spoken dialogue.
6. Return bounding boxes relative to the image.

Return JSON in this exact format:

{
  "blocks": [
    {
      "x": number,
      "y": number,
      "width": number,
      "height": number,
      "translated_text": string
    }
  ]
}
`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/webp;base64,${base64}`
              }
            }
          ]
        }
      ]
    });

    const content = completion.choices[0].message.content;
    const parsed = JSON.parse(content);

    return res.status(200).json(parsed);

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
