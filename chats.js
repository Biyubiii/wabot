const { readDB } = require('./db');

// Fungsi untuk melihat daftar chat atau sesi aktif
function getActiveChats() {
    const db = readDB();
    return db.chats ? Object.keys(db.chats) : [];
}

function getChatHistory(senderId) {
    const db = readDB();
    return db.chats && db.chats[senderId] ? db.chats[senderId] : [];
}

module.exports = {
    getActiveChats,
    getChatHistory
};