import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";
const API_KEY = process.env.GEMINI_API_KEY;

export async function generateBookDescription(bookTitle: string, details: string, tone: string) {
    if (!API_KEY) {
        console.error("❌ Missing Gemini API Key!");
        throw new Error("Missing Gemini API Key");
    }

    try {
        console.log(`🔍 Sending request to Gemini API with key: ${API_KEY}`);
        console.log(`📖 Book Title: ${bookTitle}, Details: ${details}, Tone: ${tone}`);

        interface GeminiResponse {
            candidates: { content: { parts: { text: string }[] } }[];
        }

        const response = await axios.post<GeminiResponse>(`${GEMINI_API_URL}?key=${API_KEY}`, {
            contents: [{ parts: [{ text: `Write a description for a book titled "${bookTitle}" with the following details: ${details}. The desired tone is ${tone}.` }] }]
        });

        console.log("✅ Gemini API Response:", response.data);

        return response.data.candidates[0]?.content.parts[0]?.text || "No description found.";
    } catch (error: any) {
        console.error("❌ Error generating book description:", error.response?.data || error.message);
        return "An error occurred while generating the description.";
    }
}
