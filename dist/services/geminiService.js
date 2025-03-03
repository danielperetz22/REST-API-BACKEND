"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBookDescription = generateBookDescription;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";
const API_KEY = process.env.GEMINI_API_KEY;
async function generateBookDescription(bookTitle, details, tone) {
    var _a, _b, _c;
    if (!API_KEY) {
        console.error("❌ Missing Gemini API Key!");
        throw new Error("Missing Gemini API Key");
    }
    try {
        console.log(`🔍 Sending request to Gemini API with key: ${API_KEY}`);
        console.log(`📖 Book Title: ${bookTitle}, Details: ${details}, Tone: ${tone}`);
        const response = await axios_1.default.post(`${GEMINI_API_URL}?key=${API_KEY}`, {
            contents: [{ parts: [{ text: `Write a description for a book titled "${bookTitle}" with the following details: ${details}. The desired tone is ${tone}.` }] }]
        });
        console.log("✅ Gemini API Response:", response.data);
        return ((_b = (_a = response.data.candidates[0]) === null || _a === void 0 ? void 0 : _a.content.parts[0]) === null || _b === void 0 ? void 0 : _b.text) || "No description found.";
    }
    catch (error) {
        console.error("❌ Error generating book description:", ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message);
        return "An error occurred while generating the description.";
    }
}
