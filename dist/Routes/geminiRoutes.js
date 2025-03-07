"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const geminiService_1 = require("../services/geminiService");
const router = express_1.default.Router();
router.post("/generate-description", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookTitle, details, tone } = req.body;
    if (!bookTitle || !details || !tone) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    try {
        const description = yield (0, geminiService_1.generateBookDescription)(bookTitle, details, tone);
        res.json({ description });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate book description" });
    }
}));
exports.default = router;
//# sourceMappingURL=geminiRoutes.js.map