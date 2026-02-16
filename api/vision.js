export default async function handler(req, res) {

  // 🔥 CORS HEADERS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🔥 Responder ao preflight
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

    // 👇 TESTE TEMPORÁRIO (simulação)
    // Só para confirmar que CORS funciona
    return res.status(200).json({
      blocks: [
        {
          x: 300,
          y: 300,
          width: 250,
          height: 120,
          translated_text: "Tradução de teste OK"
        }
      ]
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
