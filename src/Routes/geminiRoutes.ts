import express from "express";
import { generateBookDescription } from "../services/geminiService";

const router = express.Router();

router.post("/generate-description", async (req: express.Request, res: express.Response): Promise<void> => {
    const { bookTitle, details, tone } = req.body;

    if (!bookTitle || !details || !tone) {
         res.status(400).json({ error: "Missing required fields" });
         return;
    }

    try {
        const description = await generateBookDescription(bookTitle, details, tone);
        res.json({ description });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate book description" });
    }
});

export default router;
