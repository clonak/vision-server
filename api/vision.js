export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { imageIndex, imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: "Missing imageUrl" });
        }

        // Aqui vais integrar:
        // 1. OCR (Google Vision ou Tesseract)
        // 2. Tradução (GPT ou outro modelo)
        // 3. Deteção de bounding boxes

        // 🔥 Por agora exemplo mock:

        const mockBlocks = [
            {
                x: 100,
                y: 150,
                width: 300,
                height: 100,
                translated_text: "Exemplo de tradução 1"
            },
            {
                x: 200,
                y: 500,
                width: 280,
                height: 90,
                translated_text: "Exemplo de tradução 2"
            }
        ];

        return res.status(200).json({
            imageIndex,
            blocks: mockBlocks
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
