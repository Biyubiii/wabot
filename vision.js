const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

// Inisialisasi khusus untuk Gemini Vision
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function getPersona() {
    const personaPath = path.join(__dirname, 'persona.md');
    if (fs.existsSync(personaPath)) {
        return fs.readFileSync(personaPath, 'utf8');
    }
    return "Kamu adalah Yubi, asisten virtual yang pemalu tapi tegas.";
}

// Fungsi utama untuk memproses gambar
async function generateVisionResponse(imageBuffer, caption = "") {
    const persona = getPersona();

    try {
        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: "image/jpeg"
            },
        };

        const promptText = `[INSTRUKSI SISTEM / PERSONA]\n${persona}\n\nPengguna mengirimkan sebuah gambar dengan keterangan/caption: "${caption}". Tolong amati gambar tersebut dan berikan tanggapan atau komentar sesuai dengan karakter dan kepribadianmu.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [promptText, imagePart],
        });

        return response.text || "Um... Yubi melihat gambarnya, tapi bingung harus berkomentar apa... (๑-﹏-๑)";

    } catch (error) {
        console.error("Gagal memproses gambar:", error.message);
        return "Maaf... mata Yubi agak buram, gagal memuat gambar yang kamu kirim... (>_<)";
    }
}

module.exports = {
    generateVisionResponse
};