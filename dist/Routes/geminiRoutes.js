"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const geminiService_1 = require("../services/geminiService");
const router = express_1.default.Router();
router.post("/generate-description", async (req, res) => {
    const { bookTitle, details, tone } = req.body;
    if (!bookTitle || !details || !tone) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    try {
        const description = await (0, geminiService_1.generateBookDescription)(bookTitle, details, tone);
        res.json({ description });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate book description" });
    }
});
exports.default = router;
