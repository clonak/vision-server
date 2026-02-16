// /api/vision.js

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
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Missing imageUrl" });
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
You are an OCR + translation engine specialized in manga and manhwa.
Return ONLY valid JSON.
Detect every speech bubble separately.
Do not merge balloons.
Translate naturally to European Portuguese.
`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
Analyse this manga image.
For each speech bubble detected return:

{
  "blocks": [
    {
      "x": number,
      "y": number,
      "width": number,
      "height": number,
      "translated_text": "string"
    }
  ]
}

Coordinates must match the original image resolution.
Return JSON only.
`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        temperature: 0.2
      })
    });

    const data = await openaiResponse.json();

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: "No content returned from OpenAI" });
    }

    // Limpar possíveis ```json
    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);

  } catch (err) {
    console.error("Vision error:", err);
    return res.status(500).json({ error: "Vision processing failed" });
  }
}
