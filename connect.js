const {
    default: makeWASocket,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    Browsers,
    delay,
    DisconnectReason
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

const activeSessions = {};

function removeDir(p) {
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

async function connectWhatsApp(bot, chatId, number) {
    if (activeSessions[number]) {
        return bot.telegram.sendMessage(chatId,
            `⚠️ Une session est déjà en cours pour ce numéro.\nAttends quelques secondes.`
        );
    }

    const sessionId = number + '_' + Date.now();
    const tempDir = path.join(process.cwd(), 'temp', sessionId);
    activeSessions[number] = true;

    await bot.telegram.sendMessage(chatId,
`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃      🔗 CONNECT 🔗      ┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

🔑 Demande d'appairage envoyée pour ${number}.
⏳ Le code va arriver...`
    );

    try {
        const { state, saveCreds } = await useMultiFileAuthState(tempDir);

        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(
                    state.keys,
                    pino({ level: 'fatal' }).child({ level: 'fatal' })
                ),
            },
            printQRInTerminal: false,
            logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
            browser: Browsers.ubuntu('Chrome'),
            syncFullHistory: false,
        });

        sock.ev.on('creds.update', saveCreds);

        let codeSent = false;

        sock.ev.on('connection.update', async (s) => {
            const { connection, lastDisconnect } = s;

            if (!codeSent && !sock.authState.creds.registered) {
                codeSent = true;
                try {
                    await delay(3000);
                    const code = await sock.requestPairingCode(number.trim());
                    const formatted = code?.match(/.{1,4}/g)?.join('-') || code;

                    await bot.telegram.sendMessage(chatId,
`🔑 Ton code d'appareil est :

*${formatted}*`,
                        { parse_mode: 'Markdown' }
                    );

                    await bot.telegram.sendMessage(chatId, formatted, {
                        reply_markup: {
                            inline_keyboard: [[
                                { text: '📋 Copier le code', callback_data: `copy_${formatted}` }
                            ]]
                        }
                    });

                } catch (err) {
                    delete activeSessions[number];
                    removeDir(tempDir);
                    await bot.telegram.sendMessage(chatId,
                        `❌ Erreur génération code : ${err.message}\n\nVérifie que le numéro est correct.`
                    );
                }
            }

            if (connection === 'open') {
                await delay(3000);
                try {
                    await sock.sendMessage(sock.user.id, {
                        text: `🥷 *ITACHI-XMD* connecté via Telegram !\n\nTape *.menu* pour voir les commandes.\n\n> Propulsé par IBSACKO™ · CENTRAL-HEX`
                    });
                } catch {}

                await bot.telegram.sendMessage(chatId,
`✅ *WhatsApp connecté !*

📞 Numéro : +${number}
🤖 Bot : ITACHI-XMD
✅ Tu peux maintenant utiliser le bot sur WhatsApp !

Tape *.menu* sur WhatsApp pour commencer.`,
                    { parse_mode: 'Markdown' }
                );

                delete activeSessions[number];
                try { sock.ws.close(); } catch {}
                removeDir(tempDir);

            } else if (connection === 'close') {
                const code = lastDisconnect?.error?.output?.statusCode;
                if (code !== DisconnectReason.loggedOut && !codeSent) {
                    delete activeSessions[number];
                    removeDir(tempDir);
                }
            }
        });

        setTimeout(() => {
            if (activeSessions[number]) {
                delete activeSessions[number];
                try { sock.ws.close(); } catch {}
                removeDir(tempDir);
            }
        }, 3 * 60 * 1000);

    } catch (err) {
        delete activeSessions[number];
        removeDir(tempDir);
        await bot.telegram.sendMessage(chatId, `❌ Erreur : ${err.message}`);
    }
}

module.exports = { connectWhatsApp };
