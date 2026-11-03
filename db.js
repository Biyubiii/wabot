const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, 'database.json');

// Inisialisasi database jika belum ada
function initDB() {
    if (!fs.existsSync(dbFile)) {
        fs.writeFileSync(dbFile, JSON.stringify({ users: {}, chats: {} }, null, 2));
        console.log('Database lokal berhasil dibuat.');
    }
}

// Membaca data dari database
function readDB() {
    initDB();
    const data = fs.readFileSync(dbFile, 'utf8');
    return JSON.parse(data);
}

// Menulis data ke database
function writeDB(data) {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

module.exports = {
    initDB,
    readDB,
    writeDB
};