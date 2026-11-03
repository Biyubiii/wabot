const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const { Groq } = require('groq-sdk');

// Inisialisasi kedua klien AI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const geminiAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function getPersona() {
    const personaPath = path.join(__dirname, 'persona.md');
    if (fs.existsSync(personaPath)) {
        return fs.readFileSync(personaPath, 'utf8');
    }
    return "Kamu adalah Yubi, asisten virtual yang pemalu tapi tegas.";
}

async function generateAIResponse(userMessage, chatHistory = []) {
    const persona = getPersona();

    // 1. UTAMA: Coba gunakan Groq terlebih dahulu (Super cepat)
    try {
        const messages = [
            { role: 'system', content: persona }
        ];

        if (chatHistory && chatHistory.length > 0) {
            for (const chat of chatHistory) {
                messages.push({
                    role: chat.role === 'assistant' ? 'assistant' : 'user',
                    content: chat.content
                });
            }
        } else {
            messages.push({ role: 'user', content: userMessage });
        }

        const groqResponse = await groq.chat.completions.create({
            model: 'openai/gpt-oss-120b', // Ganti dengan nama model yang sesuai dari dashboard Anda
            messages: messages,
            temperature: 0.7,
        });

        const reply = groqResponse.choices[0]?.message?.content;
        if (reply) return reply;

    } catch (groqError) {
        console.log("⚠️ Groq utama gagal/limit. Mengalihkan ke Gemini AI (Backup)...");
    }

    // 2. CADANGAN (BACKUP): Jika Groq gagal, otomatis beralih ke Gemini AI
    try {
        const contents = [
            {
                role: 'user',
                parts: [{ text: `[INSTRUKSI SISTEM / PERSONA]\n${persona}\nTolong patuhi karakter ini.` }]
            },
            {
                role: 'model',
                parts: [{ text: "Baik, saya mengerti. Saya Yubi." }]
            }
        ];

        if (chatHistory && chatHistory.length > 0) {
            for (const chat of chatHistory) {
                contents.push({
                    role: chat.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: chat.content }]
                });
            }
        } else {
            contents.push({ role: 'user', parts: [{ text: userMessage }] });
        }

        const response = await geminiAi.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: contents,
        });

        return response.text || "Um... Yubi bingung... (๑-﹏-๑)";

    } catch (geminiError) {
        console.error("❌ Gemini backup juga gagal:", geminiError.message);
        return "Um... maaf ya, semua server AI Yubi sedang mengalami gangguan jaringan... (>_<) Coba sebentar lagi ya.";
    }
}

module.exports = {
    generateAIResponse
};