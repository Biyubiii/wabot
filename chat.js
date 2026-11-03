const { generateAIResponse } = require('./ai');
const { generateVisionResponse } = require('./vision');
const { readDB, writeDB } = require('./db');

async function handleIncomingMessage(senderId, messageText) {
    const db = readDB();
    if (!db.chats) db.chats = {};
    if (!db.chats[senderId]) db.chats[senderId] = [];

    db.chats[senderId].push({ role: 'user', content: messageText });
    const replyText = await generateAIResponse(messageText, db.chats[senderId]);

    db.chats[senderId].push({ role: 'assistant', content: replyText });
    writeDB(db);

    return replyText;
}

async function handleImageMessage(senderId, imageBuffer, caption) {
    // Menggunakan fungsi vision untuk membaca gambar dan caption dari pengguna
    const replyText = await generateVisionResponse(imageBuffer, caption);
    return replyText;
}

module.exports = {
    handleIncomingMessage,
    handleImageMessage
};