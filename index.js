const { makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const { handleIncomingMessage, handleImageMessage } = require('./chat');

// Membuat antarmuka untuk membaca input nomor HP dari terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // Kita matikan QR Code karena pakai pairing code
    });

    // Jika belum terhubung dan belum ada kredensial tersimpan, gunakan Pairing Code
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('📱 Masukkan nomor WhatsApp bot Anda (Contoh: 628xxxxxxxxxx): ');
        
        // Bersihkan spasi atau karakter non-angka jika ada
        const cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
        
        try {
            // Tunggu sebentar agar socket siap
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const code = await sock.requestPairingCode(cleanedNumber);
            console.log(`\n🔑 Kode Pairing WhatsApp Anda: \x1b[32m${code}\x1b[0m\n`);
            console.log('Silakan masukkan kode ini di aplikasi WhatsApp Anda (Perangkat Tertaut > Tautkan dengan nomor telepon).\n');
        } catch (err) {
            console.error('❌ Gagal menghasilkan pairing code:', err.message);
        }
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('🔄 Koneksi terputus, menghubungkan kembali...');
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✨ Yubi berhasil terhubung ke WhatsApp! (๑>◡<๑)');
            rl.close();
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const senderId = msg.key.remoteJid;
        const messageContent = msg.message;

        // Penanganan pesan gambar
        if (messageContent.imageMessage) {
            const caption = messageContent.imageMessage.caption || '';
            console.log(`🖼️ [Gambar diterima dari ${senderId.split('@')[0]}] Caption: "${caption}"`);

            try {
                const buffer = await downloadMediaMessage(
                    msg,
                    'buffer',
                    {},
                    { logger: pino({ level: 'silent' }) }
                );

                const replyText = await handleImageMessage(senderId, buffer, caption);
                await sock.sendMessage(senderId, { text: replyText }, { quoted: msg });
                console.log(`🤖 [Yubi membalas gambar] Selesai.`);
            } catch (err) {
                console.error("❌ Gagal unduh gambar:", err.message);
            }

        } else {
            // Penanganan pesan teks biasa
            const messageText = messageContent.conversation || messageContent.extendedTextMessage?.text;
            if (!messageText) return;

            console.log(`📩 [Pesan] ${senderId.split('@')[0]}: ${messageText}`);
            const replyText = await handleIncomingMessage(senderId, messageText);
            await sock.sendMessage(senderId, { text: replyText }, { quoted: msg });
            console.log(`🤖 [Yubi membalas] Selesai.`);
        }
    });
}

startBot();