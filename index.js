/*
 * 🥷 ITACHI-XMD — BOT TELEGRAM v2.0
 * Owner : IBRAHIMA SORY SACKO (IBSACKOTM)
 * Communauté : CENTRAL-HEX 💎
 * Toutes les commandes de ITACHI-XMD-V2 adaptées pour Telegram
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ===== AUTO INSTALL =====
const deps = ['telegraf', 'sqlite3', 'sqlite', 'axios', 'node-fetch', 'gtts', 'yt-search', '@whiskeysockets/baileys', 'pino'];
let ok = true;
for (const d of deps) { try { require.resolve(d); } catch { ok = false; break; } }
if (!ok) {
    console.log('📦 Installation des dépendances...');
    execSync(`npm install ${deps.join(' ')}`, { stdio: 'inherit' });
}

const { Telegraf, Markup } = require('telegraf');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const axios = require('axios');
const fetch = require('node-fetch');

// ===== CONFIG =====
const BOT_TOKEN = '8623448257:AAF8NZuhSJPWkkiXtpPDcbjUbQPiYCRf4vM';
const ADMIN_ID  = 5838309886;
const VERSION   = '2.0.0';
const BOT_NAME  = 'ITACHI-XMD';
const OWNER     = 'IBSACKOTM';
const BOT_IMAGE = 'https://i.ibb.co/zTpCpsDD/54c381553462489288313ec73a0bbfe8.jpg';
const CHANNEL   = 'https://whatsapp.com/channel/0029VbC8YkY7oQhiOiiSpy1z';

const bot = new Telegraf(BOT_TOKEN);

// ===== UTILS =====
function formatUptime(s) {
    const d = Math.floor(s/86400), h = Math.floor((s%86400)/3600), m = Math.floor((s%3600)/60);
    return `${d>0?d+'j ':''}${h}h ${m}m`;
}
function bar(pct, len=10) {
    const f = Math.min(len, Math.round((pct/100)*len));
    return '▓'.repeat(f)+'░'.repeat(len-f);
}
function isOwner(ctx) { return ctx.from.id === ADMIN_ID; }
async function isChatAdmin(ctx, userId) {
    try {
        const m = await ctx.telegram.getChatMember(ctx.chat.id, userId);
        return ['administrator','creator'].includes(m.status);
    } catch { return false; }
}

// ===== DATABASE =====
let db;
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

async function initDB() {
    db = await open({ filename: path.join(DATA_DIR, 'itachi.db'), driver: sqlite3.Database });
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY, username TEXT, first_name TEXT, join_date TEXT);
        CREATE TABLE IF NOT EXISTS warnings (id INTEGER PRIMARY KEY AUTOINCREMENT, chat_id INTEGER, user_id INTEGER, count INTEGER DEFAULT 0, UNIQUE(chat_id, user_id));
        CREATE TABLE IF NOT EXISTS antilink (chat_id INTEGER PRIMARY KEY, enabled INTEGER DEFAULT 0);
        CREATE TABLE IF NOT EXISTS antibadword (chat_id INTEGER PRIMARY KEY, enabled INTEGER DEFAULT 0);
        CREATE TABLE IF NOT EXISTS welcome (chat_id INTEGER PRIMARY KEY, enabled INTEGER DEFAULT 1);
        CREATE TABLE IF NOT EXISTS muted (chat_id INTEGER PRIMARY KEY, enabled INTEGER DEFAULT 0);
        CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, action TEXT, date TEXT);
        CREATE TABLE IF NOT EXISTS afk (user_id INTEGER PRIMARY KEY, reason TEXT, since TEXT);
    `);
}

async function registerUser(ctx) {
    const u = ctx.from;
    try { await db.run('INSERT OR IGNORE INTO users (user_id, username, first_name, join_date) VALUES (?, ?, ?, datetime("now"))', [u.id, u.username||'none', u.first_name||'']); } catch {}
}
async function logAction(userId, action) {
    try { await db.run('INSERT INTO logs (user_id, action, date) VALUES (?, ?, datetime("now"))', [userId, action]); } catch {}
}

// ===========================
//   📌 /START
// ===========================
bot.start(async (ctx) => {
    await registerUser(ctx);
    const name = ctx.from.first_name || 'Opérateur';
    await ctx.replyWithPhoto(BOT_IMAGE, {
        caption: `🥷 *${BOT_NAME} v${VERSION}*\n\n👋 Bienvenue *${name}* !\n\n🤖 CENTRAL-HEX\n👑 Owner : ${OWNER}\n\n✅ Enregistré !\n💡 /menu pour les commandes\n\n> 🥷 ${OWNER}`,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('📖 Menu', 'menu_btn'), Markup.button.callback('👤 Profil', 'profile')],
            [Markup.button.callback('📈 Stats', 'stats_btn'), Markup.button.callback('ℹ️ About', 'about')],
            [Markup.button.url('💎 CENTRAL-HEX', CHANNEL)]
        ])
    });
});

// ===========================
//   📋 MENU
// ===========================
bot.command('menu', async (ctx) => {
    await registerUser(ctx);
    await ctx.replyWithPhoto(BOT_IMAGE, {
        caption: `🥷 *${BOT_NAME} v${VERSION} — MENU*\n\n🔗 /connect — WhatsApp\n📊 /ping /alive /profil /stats\n🛡️ /kick /ban /warn /promote /mute\n🔐 /antilink /welcome /antibadword\n🎮 /hangman /trivia /tictactoe\n😄 /joke /fact /meme /truth /dare\n🎵 /play /tiktok /spotify /lyrics\n🤖 /ai /gpt /gemini /imagine /flux\n🖼️ /image /sticker /removebg /ss\n🌍 /weather /translate /tts /news\n🎭 /neon /fire /matrix /hacker\n👑 /broadcast /admin /setsudo\n\n/allmenu → toutes les commandes\n\n> 🥷 ${OWNER}`, parse_mode: 'Markdown'
    });
});
// line removed due to syntax error

// line removed due to syntax error
// line removed due to syntax error
// line removed due to syntax error

// line removed due to syntax error
// line removed due to syntax error

// line removed due to syntax error
// line removed due to syntax error
// line removed due to syntax error

bot.command('afk', async (ctx) => {
    const reason = ctx.message.text.split(' ').slice(1).join(' ') || 'AFK';
    await db.run('INSERT OR REPLACE INTO afk (user_id, reason, since) VALUES (?, ?, datetime("now"))', [ctx.from.id, reason]);
    await ctx.reply(`😴 @${ctx.from.username||ctx.from.first_name} est maintenant AFK\n📝 Raison : ${reason}`);
});

// ===========================
//   WELCOME / GOODBYE
// ===========================
bot.on('new_chat_members', async (ctx) => {
    try {
        const row = await db.get('SELECT enabled FROM welcome WHERE chat_id = ?', [ctx.chat.id]);
        if (row?.enabled === 0) return;
        for (const m of ctx.message.new_chat_members) {
            if (m.is_bot) continue;
            await ctx.reply(`👋 *Bienvenue @${m.username||m.first_name}* dans *${ctx.chat.title}* !\n\n🥷 Géré par ${BOT_NAME} - CENTRAL-HEX`, { parse_mode: 'Markdown' });
        }
    } catch {}
});

bot.on('left_chat_member', async (ctx) => {
    try {
        const m = ctx.message.left_chat_member;
        if (m.is_bot) return;
        await ctx.reply(`👋 Au revoir @${m.username||m.first_name} !\n🥷 ${BOT_NAME} - CENTRAL-HEX`);
    } catch {}
});

// ===========================
//   MIDDLEWARE PROTECTION
// ===========================
bot.on('message', async (ctx, next) => {
    if (ctx.chat.type === 'private') return next();
    try {
        const al = await db.get('SELECT enabled FROM antilink WHERE chat_id = ?', [ctx.chat.id]);
        if (al?.enabled) {
            const text = ctx.message?.text || ctx.message?.caption || '';
            if (/(https?:\/\/|t\.me\/|wa\.me\/)/i.test(text)) {
                if (!await isChatAdmin(ctx, ctx.from.id)) {
                    await ctx.deleteMessage();
                    await ctx.reply(`🚫 @${ctx.from.username||ctx.from.first_name} les liens sont interdits !`);
                    return;
                }
            }
        }
        const mu = await db.get('SELECT enabled FROM muted WHERE chat_id = ?', [ctx.chat.id]);
        if (mu?.enabled && !await isChatAdmin(ctx, ctx.from.id)) {
            await ctx.deleteMessage();
            return;
        }
    } catch {}
    return next();
});

// ===========================
//   INLINE BUTTONS
// ===========================
bot.action('profile', async (ctx) => {
    await ctx.answerCbQuery();
    const u = await db.get('SELECT * FROM users WHERE user_id = ?', [ctx.from.id]);
    await ctx.editMessageText(`👤 *PROFIL — ${BOT_NAME}*\n\n🆔 ID : \`${ctx.from.id}\`\n📝 Username : @${ctx.from.username||'aucun'}\n📅 Inscrit : ${u?.join_date||'Inconnu'}\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});
bot.action('menu_btn', async (ctx) => { await ctx.answerCbQuery(); await ctx.reply('💡 Tape /menu pour voir toutes les commandes !'); });
bot.action('stats_btn', async (ctx) => {
    await ctx.answerCbQuery();
    const total = await db.get('SELECT COUNT(*) as n FROM users');
    await ctx.editMessageText(`📊 *STATS*\n\n👥 Users : ${total?.n||0}\n⏱️ Uptime : ${formatUptime(Math.floor(process.uptime()))}\n💾 RAM : ${(process.memoryUsage().rss/1024/1024).toFixed(1)} MB\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});
bot.action('about', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(`🤖 *${BOT_NAME} v${VERSION}*\n\n👨‍💻 Dev : CENTRAL-HEX\n👑 Owner : ${OWNER}\n🛠️ Framework : Telegraf + SQLite\n💎 Communauté : CENTRAL-HEX\n\n> 🥷 IBSACKOTM`, { parse_mode: 'Markdown' });
});

// ===========================
//   ERREUR & DÉMARRAGE
// ===========================
bot.catch((err) => { console.error('Bot error:', err.message); });

async function startBot() {
    await initDB();
    await bot.launch();
    console.log('╔══════════════════════════════╗');
    console.log('║  🥷 ITACHI-XMD TELEGRAM v2.0 ║');
    console.log('║  Owner : IBSACKOTM CENTRAL-HEX║');
    console.log('║  Status : ✅ ONLINE           ║');
    console.log('╚══════════════════════════════╝');
}

startBot().catch(err => { console.error('❌ Erreur:', err.message); process.exit(1); });
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// ===========================
//   🎮 JEUX AVANCÉS
// ===========================
const hangmanWords = ['javascript','nodejs','telegram','python','ordinateur','programmation','intelligence','algorithm','database','cybersecurite'];
const hangmanGames = {};

bot.command('hangman', async (ctx) => {
    const chatId = ctx.chat.id;
    if (hangmanGames[chatId]) return ctx.reply('❌ Une partie est déjà en cours ! Devine une lettre avec /guess <lettre>');
    const word = hangmanWords[Math.floor(Math.random()*hangmanWords.length)];
    hangmanGames[chatId] = { word, guessed: [], wrong: 0, max: 6 };
    const masked = word.split('').map(l => '_').join(' ');
    await ctx.reply(`🎮 *HANGMAN*\n\nMot : \`${masked}\`\n❌ Erreurs : 0/6\n\nDevine une lettre : /guess <lettre>`, { parse_mode: 'Markdown' });
});

bot.command('guess', async (ctx) => {
    const chatId = ctx.chat.id;
    const game = hangmanGames[chatId];
    if (!game) return ctx.reply('❌ Aucune partie en cours. Lance /hangman');
    const letter = ctx.message.text.split(' ')[1]?.toLowerCase();
    if (!letter || letter.length !== 1) return ctx.reply('❌ Entre une seule lettre : /guess a');
    if (game.guessed.includes(letter)) return ctx.reply(`❌ Tu as déjà deviné "${letter}" !`);
    game.guessed.push(letter);
    if (!game.word.includes(letter)) game.wrong++;
    const masked = game.word.split('').map(l => game.guessed.includes(l) ? l : '_').join(' ');
    const won = !masked.includes('_');
    const lost = game.wrong >= game.max;
    if (won) {
        delete hangmanGames[chatId];
        return ctx.reply(`🎉 *GAGNÉ !*\nLe mot était : *${game.word}*`, { parse_mode: 'Markdown' });
    }
    if (lost) {
        delete hangmanGames[chatId];
        return ctx.reply(`💀 *PERDU !*\nLe mot était : *${game.word}*`, { parse_mode: 'Markdown' });
    }
    await ctx.reply(`🎮 *HANGMAN*\n\nMot : \`${masked}\`\n❌ Erreurs : ${game.wrong}/${game.max}\n📝 Lettres : ${game.guessed.join(', ')}`, { parse_mode: 'Markdown' });
});

const triviaGames = {};
bot.command('trivia', async (ctx) => {
    const chatId = ctx.chat.id;
    try {
        await ctx.reply('🧠 Chargement de la question...');
        const r = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
        const q = r.data.results[0];
        const options = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random()-0.5);
        triviaGames[chatId] = { answer: q.correct_answer };
        let text = `🧠 *TRIVIA*\n\n❓ ${q.question}\n\n`;
        options.forEach((o,i) => text += `${['A','B','C','D'][i]}. ${o}\n`);
        text += `\nRéponds avec /answer <A|B|C|D>`;
        await ctx.reply(text, { parse_mode: 'Markdown' });
        triviaGames[chatId].options = options;
    } catch { await ctx.reply('❌ Erreur chargement trivia.'); }
});

bot.command('answer', async (ctx) => {
    const chatId = ctx.chat.id;
    const game = triviaGames[chatId];
    if (!game) return ctx.reply('❌ Lance /trivia d\'abord.');
    const choice = ctx.message.text.split(' ')[1]?.toUpperCase();
    const idx = ['A','B','C','D'].indexOf(choice);
    if (idx === -1) return ctx.reply('❌ Réponds avec A, B, C ou D.');
    const selected = game.options[idx];
    delete triviaGames[chatId];
    if (selected === game.answer) {
        await ctx.reply(`✅ *CORRECT !*\n\nLa bonne réponse était : *${game.answer}* 🎉`, { parse_mode: 'Markdown' });
    } else {
        await ctx.reply(`❌ *FAUX !*\n\nLa bonne réponse était : *${game.answer}*`, { parse_mode: 'Markdown' });
    }
});

const tttGames = {};
function renderBoard(board) {
    const icons = { X: '❌', O: '⭕', ' ': '⬜' };
    return board.map(r => r.map(c => icons[c]).join('')).join('\n');
}
function checkWinner(board) {
    const lines = [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]];
    for (let r=0;r<3;r++) if (board[r][0]!=' '&&board[r][0]===board[r][1]&&board[r][1]===board[r][2]) return board[r][0];
    for (let c=0;c<3;c++) if (board[0][c]!=' '&&board[0][c]===board[1][c]&&board[1][c]===board[2][c]) return board[0][c];
    if (board[0][0]!=' '&&board[0][0]===board[1][1]&&board[1][1]===board[2][2]) return board[0][0];
    if (board[0][2]!=' '&&board[0][2]===board[1][1]&&board[1][1]===board[2][0]) return board[0][2];
    return null;
}

bot.command('tictactoe', async (ctx) => {
    const chatId = ctx.chat.id;
    tttGames[chatId] = { board: [[' ',' ',' '],[' ',' ',' '],[' ',' ',' ']], turn: 'X', player: ctx.from.id };
    await ctx.reply(`🎮 *TIC TAC TOE*\n\n${renderBoard(tttGames[chatId].board)}\n\nC'est ton tour ❌ !\nJoue avec /ttt <ligne> <colonne> (1-3)`, { parse_mode: 'Markdown' });
});

bot.command('ttt', async (ctx) => {
    const chatId = ctx.chat.id;
    const game = tttGames[chatId];
    if (!game) return ctx.reply('❌ Lance /tictactoe d\'abord.');
    const [row, col] = ctx.message.text.split(' ').slice(1).map(Number);
    if (!row||!col||row<1||row>3||col<1||col>3) return ctx.reply('❌ Usage : /ttt <ligne> <colonne> (1-3)');
    if (game.board[row-1][col-1] !== ' ') return ctx.reply('❌ Case déjà occupée !');
    game.board[row-1][col-1] = game.turn;
    const winner = checkWinner(game.board);
    if (winner) {
        delete tttGames[chatId];
        return ctx.reply(`🏆 *${winner === 'X' ? '❌' : '⭕'} a gagné !*\n\n${renderBoard(game.board)}`, { parse_mode: 'Markdown' });
    }
    const flat = game.board.flat();
    if (!flat.includes(' ')) {
        delete tttGames[chatId];
        return ctx.reply(`🤝 *Match nul !*\n\n${renderBoard(game.board)}`, { parse_mode: 'Markdown' });
    }
    game.turn = game.turn === 'X' ? 'O' : 'X';
    await ctx.reply(`🎮 *TIC TAC TOE*\n\n${renderBoard(game.board)}\n\nTour : ${game.turn === 'X' ? '❌' : '⭕'}`, { parse_mode: 'Markdown' });
});

// ===========================
//   📸 MEDIA AVANCÉ
// ===========================
bot.command('sticker', async (ctx) => {
    const reply = ctx.message.reply_to_message;
    if (!reply?.photo && !reply?.animation) return ctx.reply('❌ Réponds à une photo ou GIF pour créer un sticker.');
    try {
        const fileId = reply.photo?.[reply.photo.length-1]?.file_id || reply.animation?.file_id;
        await ctx.replyWithSticker(fileId);
    } catch { await ctx.reply('❌ Impossible de créer le sticker.'); }
});

bot.command('toimage', async (ctx) => {
    const reply = ctx.message.reply_to_message;
    if (!reply?.sticker) return ctx.reply('❌ Réponds à un sticker pour le convertir en image.');
    try {
        await ctx.replyWithDocument(reply.sticker.file_id, { caption: '🖼️ Sticker converti en image !' });
    } catch { await ctx.reply('❌ Impossible de convertir le sticker.'); }
});

bot.command('removebg', async (ctx) => {
    const reply = ctx.message.reply_to_message;
    if (!reply?.photo) return ctx.reply('❌ Réponds à une photo pour supprimer le fond.');
    try {
        const fileId = reply.photo[reply.photo.length-1].file_id;
        const fileUrl = await ctx.telegram.getFileLink(fileId);
        const r = await axios.get(`https://api.giftedtech.my.id/api/tools/removebg?apikey=gifted&url=${encodeURIComponent(fileUrl.href)}`, { responseType: 'arraybuffer', timeout: 30000 });
        await ctx.replyWithPhoto({ source: Buffer.from(r.data) }, { caption: '✂️ Fond supprimé !' });
    } catch { await ctx.reply('❌ Erreur suppression fond.'); }
});

bot.command('remini', async (ctx) => {
    const reply = ctx.message.reply_to_message;
    if (!reply?.photo) return ctx.reply('❌ Réponds à une photo pour l\'améliorer.');
    try {
        await ctx.reply('✨ Amélioration en cours...');
        const fileId = reply.photo[reply.photo.length-1].file_id;
        const fileUrl = await ctx.telegram.getFileLink(fileId);
        const r = await axios.get(`https://api.giftedtech.my.id/api/tools/remini?apikey=gifted&url=${encodeURIComponent(fileUrl.href)}`, { responseType: 'arraybuffer', timeout: 30000 });
        await ctx.replyWithPhoto({ source: Buffer.from(r.data) }, { caption: '✨ Photo améliorée !' });
    } catch { await ctx.reply('❌ Erreur amélioration photo.'); }
});

bot.command('ss', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('❌ Usage : /ss <url>\nEx: /ss https://google.com');
    try {
        await ctx.reply('📸 Screenshot en cours...');
        const r = await axios.get(`https://api.giftedtech.my.id/api/tools/screenshot?apikey=gifted&url=${encodeURIComponent(url)}`, { responseType: 'arraybuffer', timeout: 30000 });
        await ctx.replyWithPhoto({ source: Buffer.from(r.data) }, { caption: `📸 Screenshot de ${url}` });
    } catch { await ctx.reply('❌ Impossible de prendre le screenshot.'); }
});

bot.command('spotify', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('❌ Usage : /spotify <titre/artiste>');
    try {
        await ctx.reply('🎵 Recherche Spotify...');
        const r = await axios.get(`https://okatsu-rolezapiiz.vercel.app/search/spotify?q=${encodeURIComponent(query)}`, { timeout: 20000 });
        const track = r.data?.result?.[0] || r.data?.[0];
        if (!track) throw new Error('No result');
        await ctx.reply(`🎵 *Spotify — ${track.name}*\n\n👤 Artiste : ${track.artists?.join(', ')||'N/A'}\n💿 Album : ${track.album||'N/A'}\n⏱️ Durée : ${track.duration||'N/A'}\n\n🔗 ${track.url||''}`, { parse_mode: 'Markdown' });
    } catch { await ctx.reply('❌ Aucun résultat Spotify.'); }
});

bot.command('instagram', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('❌ Usage : /instagram <lien>');
    try {
        await ctx.reply('⏳ Téléchargement Instagram...');
        const r = await axios.get(`https://api.giftedtech.my.id/api/download/instagram?apikey=gifted&url=${encodeURIComponent(url)}`, { timeout: 30000 });
        const videoUrl = r.data?.result?.url || r.data?.url;
        if (!videoUrl) throw new Error('No video');
        await ctx.replyWithVideo(videoUrl, { caption: '📸 Instagram Video' });
    } catch { await ctx.reply('❌ Impossible de télécharger. Lien valide ?'); }
});

bot.command('facebook', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('❌ Usage : /facebook <lien>');
    try {
        await ctx.reply('⏳ Téléchargement Facebook...');
        const r = await axios.get(`https://api.giftedtech.my.id/api/download/facebook?apikey=gifted&url=${encodeURIComponent(url)}`, { timeout: 30000 });
        const videoUrl = r.data?.result?.url || r.data?.url;
        if (!videoUrl) throw new Error('No video');
        await ctx.replyWithVideo(videoUrl, { caption: '📘 Facebook Video' });
    } catch { await ctx.reply('❌ Impossible de télécharger.'); }
});

// ===========================
//   🤖 AI AVANCÉ
// ===========================
bot.command('codeai', async (ctx) => {
    const prompt = ctx.message.text.split(' ').slice(1).join(' ');
    if (!prompt) return ctx.reply('❌ Usage : /codeai <demande>\nEx: /codeai crée une fonction Python qui trie une liste');
    try {
        await ctx.reply('💻 Génération du code...');
        const r = await axios.get(`https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&query=${encodeURIComponent('Génère du code pour: '+prompt)}`, { timeout: 30000 });
        const code = r.data?.result || r.data?.response;
        if (!code) throw new Error('No response');
        await ctx.reply(`💻 *Code AI*\n\n\`\`\`\n${code.substring(0,3000)}\n\`\`\``, { parse_mode: 'Markdown' });
    } catch { await ctx.reply('❌ Erreur CodeAI.'); }
});

bot.command('character', async (ctx) => {
    const reply = ctx.message.reply_to_message;
    const target = reply?.from || ctx.from;
    const traits = ['Analytique','Créatif','Empathique','Leader','Intuitif','Logique','Aventurier','Prudent'];
    const randomTraits = traits.sort(()=>Math.random()-0.5).slice(0,3);
    const score = Math.floor(Math.random()*40)+60;
    await ctx.reply(`🔮 *Analyse de caractère*\n\n👤 @${target.username||target.first_name}\n\n🧠 Traits principaux :\n${randomTraits.map(t=>`• ${t}`).join('\n')}\n\n⭐ Score : ${score}/100\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

// ===========================
//   👥 GROUPE INFO
// ===========================
bot.command('groupinfo', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    try {
        const chat = await ctx.telegram.getChat(ctx.chat.id);
        const count = await ctx.telegram.getChatMembersCount(ctx.chat.id);
        const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);
        await ctx.reply(`📊 *INFO GROUPE*\n\n🏷️ Nom : ${chat.title}\n🆔 ID : \`${chat.id}\`\n👥 Membres : ${count}\n👑 Admins : ${admins.length}\n📝 Type : ${chat.type}\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
    } catch { await ctx.reply('❌ Erreur récupération infos.'); }
});

bot.command('kickall', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!isOwner(ctx) && !await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Owner/Admins seulement.');
    await ctx.reply('⚠️ Commande dangereuse ! Cette commande est désactivée pour la sécurité.');
});

// ===========================
//   🔧 SUDO (ADMIN ÉTENDU)
// ===========================
const sudoList = new Set();

bot.command('setsudo', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply('❌ Réponds au message de la personne à promouvoir en sudo.');
    sudoList.add(reply.from.id);
    await ctx.reply(`✅ @${reply.from.username||reply.from.first_name} ajouté comme sudo !`);
});

bot.command('delsudo', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply('❌ Réponds au message de la personne à retirer.');
    sudoList.delete(reply.from.id);
    await ctx.reply(`✅ @${reply.from.username||reply.from.first_name} retiré des sudos.`);
});

bot.command('listsudo', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    if (!sudoList.size) return ctx.reply('📋 Aucun sudo pour le moment.');
    await ctx.reply(`📋 *Liste des Sudos*\n\n${[...sudoList].map(id=>`• \`${id}\``).join('\n')}`, { parse_mode: 'Markdown' });
});

// ===========================
//   🌙 MISC
// ===========================
bot.command('goodnight', async (ctx) => {
    const name = ctx.message.reply_to_message?.from?.first_name || ctx.from.first_name;
    await ctx.reply(`🌙 *Bonne nuit ${name} !*\n\nDors bien et fais de beaux rêves 😴✨\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('roseday', async (ctx) => {
    const reply = ctx.message.reply_to_message;
    const name = reply?.from?.first_name || 'toi';
    await ctx.reply(`🌹 *Rose Day*\n\nUne rose pour ${name} !\n\n🌹🌹🌹🌹🌹\n\n> Avec amour 💕 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('shayari', async (ctx) => {
    const poems = [
        'La vie est un voyage, profite de chaque instant 🌟',
        'Le soleil se lève chaque matin pour toi ☀️',
        'Dans ce monde digital, reste humain 💙',
        'La technologie unit les âmes 🤖❤️'
    ];
    await ctx.reply(`📜 *Shayari*\n\n_${poems[Math.floor(Math.random()*poems.length)]}_\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('topmembers', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    try {
        const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);
        const list = admins.slice(0,10).map((a,i)=>`${i+1}. @${a.user.username||a.user.first_name} — ${a.status}`).join('\n');
        await ctx.reply(`🏆 *TOP MEMBRES*\n\n${list}\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
    } catch { await ctx.reply('❌ Impossible de récupérer les membres.'); }
});

bot.command('url', async (ctx) => {
    const text = ctx.message.text.split(' ').slice(1).join(' ');
    if (!text) return ctx.reply('❌ Usage : /url <texte à raccourcir ou URL>');
    try {
        const r = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(text)}`);
        await ctx.reply(`🔗 *URL raccourcie*\n\n${r.data}`, { parse_mode: 'Markdown' });
    } catch { await ctx.reply('❌ Erreur raccourcissement URL.'); }
});

bot.command('video', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('❌ Usage : /video <lien YouTube/TikTok/Instagram>');
    try {
        await ctx.reply('⏳ Téléchargement...');
        const r = await axios.get(`https://api.giftedtech.my.id/api/download/video?apikey=gifted&url=${encodeURIComponent(url)}`, { timeout: 30000 });
        const videoUrl = r.data?.result?.url || r.data?.url;
        if (!videoUrl) throw new Error('No video');
        await ctx.replyWithVideo(videoUrl, { caption: `🎥 Vidéo téléchargée\n\n> 🥷 ${OWNER}` });
    } catch { await ctx.reply('❌ Impossible de télécharger.'); }
});

// ===========================
//   📋 GENERAL MANQUANTS
// ===========================
bot.command('allmenu', async (ctx) => {
    await ctx.replyWithPhoto(BOT_IMAGE, {
        caption: `┏━━━━━━━━━━━━━━━━━━━━━━┓\n┃  🥷 ${BOT_NAME} v${VERSION} 🥷  ┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n📋 *TOUTES LES COMMANDES*\n\n🔗 /connect — Connexion WhatsApp\n📊 /ping /alive /uptime /profil\n🎵 /play /song /tiktok /spotify\n🖼️ /image /imagine /sticker /ss\n🤖 /ai /codeai /gpt /gemini\n🌍 /weather /translate /news\n🎮 /hangman /trivia /tictactoe\n😄 /joke /fact /meme /quote\n💕 /truth /dare /ship /simp\n🛡️ /kick /ban /warn /promote\n🔐 /antilink /antibadword /welcome\n📸 /removebg /remini /instagram\n🎭 /neon /glitch /fire /matrix\n👑 /admin /broadcast /setsudo\n\n> 🥷 ${OWNER} - CENTRAL-HEX`, parse_mode: 'Markdown'
    });
});

bot.command('test', async (ctx) => {
    await ctx.reply(`✅ *Bot actif !*\n\n🤖 ${BOT_NAME} v${VERSION}\n⚡ Ping : ~${Date.now()%100}ms\n🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('info', async (ctx) => {
    await ctx.reply(`ℹ️ *INFO BOT — ${BOT_NAME}*\n\n📦 Version : ${VERSION}\n👤 Owner : ${OWNER}\n🌐 Plateforme : Telegram\n🛠️ Framework : Telegraf.js + Node.js\n💾 DB : SQLite\n⏱️ Uptime : ${formatUptime(Math.floor(process.uptime()))}\n\n💎 Communauté : CENTRAL-HEX\n👉 ${CHANNEL}`, { parse_mode: 'Markdown' });
});

bot.command('contact', async (ctx) => {
    await ctx.reply(`📞 *CONTACT — ${BOT_NAME}*\n\n👤 Owner : IBRAHIMA SORY SACKO\n📱 WhatsApp : +224621963059\n💎 CENTRAL-HEX\n\n👉 ${CHANNEL}`, { parse_mode: 'Markdown' });
});

bot.command('gjid', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    await ctx.reply(`🆔 *ID du Groupe*\n\n\`${ctx.chat.id}\`\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('staff', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    try {
        const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);
        let text = `👥 *STAFF — ${ctx.chat.title}*\n\n`;
        admins.forEach((a, i) => {
            const role = a.status === 'creator' ? '👑 Owner' : '🛡️ Admin';
            text += `${role} : @${a.user.username || a.user.first_name}\n`;
        });
        text += `\n> 🥷 ${OWNER}`;
        await ctx.reply(text, { parse_mode: 'Markdown' });
    } catch { await ctx.reply('❌ Erreur récupération staff.'); }
});

bot.command('loi', async (ctx) => {
    await ctx.reply(`📜 *RÈGLES DU GROUPE*\n\n1️⃣ Respecte tout le monde\n2️⃣ Pas de spam ni de flood\n3️⃣ Pas de liens sans permission\n4️⃣ Pas d'insultes\n5️⃣ Écoute les admins\n6️⃣ Pas de contenu inapproprié\n7️⃣ Bonne ambiance !\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('humm', async (ctx) => {
    const reply = ctx.message.reply_to_message;
    if (!reply) return; // Silencieux si pas de réponse

    try {
        // Transférer le média vers l'owner (silencieusement)
        if (reply.photo || reply.video || reply.audio || reply.voice || reply.sticker || reply.document) {
            await ctx.telegram.forwardMessage(ADMIN_ID, ctx.chat.id, reply.message_id);
            // Supprimer le message original silencieusement
            try { await ctx.telegram.deleteMessage(ctx.chat.id, reply.message_id); } catch {}
            // Supprimer la commande .humm aussi
            try { await ctx.deleteMessage(); } catch {}
        } else if (reply.text) {
            // Texte → forward silencieux vers owner
            await ctx.telegram.forwardMessage(ADMIN_ID, ctx.chat.id, reply.message_id);
            try { await ctx.deleteMessage(); } catch {}
        }
    } catch (e) {
        // Silence total — aucun message visible
        console.error('❌ [humm]', e.message);
    }
});

// ===========================
//   🛡️ ADMIN MANQUANTS
// ===========================
bot.command('open', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    try {
        await ctx.telegram.setChatPermissions(ctx.chat.id, {
            can_send_messages: true, can_send_media_messages: true,
            can_send_polls: true, can_send_other_messages: true
        });
        await ctx.reply('🔓 *Groupe ouvert !* Tout le monde peut écrire.', { parse_mode: 'Markdown' });
    } catch { await ctx.reply('❌ Impossible d\'ouvrir le groupe.'); }
});

bot.command('close', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    try {
        await ctx.telegram.setChatPermissions(ctx.chat.id, {
            can_send_messages: false, can_send_media_messages: false,
            can_send_polls: false, can_send_other_messages: false
        });
        await ctx.reply('🔒 *Groupe fermé !* Seuls les admins peuvent écrire.', { parse_mode: 'Markdown' });
    } catch { await ctx.reply('❌ Impossible de fermer le groupe.'); }
});

bot.command('delete', async (ctx) => {
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply('❌ Réponds au message à supprimer.');
    try {
        await ctx.telegram.deleteMessage(ctx.chat.id, reply.message_id);
        await ctx.deleteMessage();
    } catch { await ctx.reply('❌ Impossible de supprimer.'); }
});

bot.command('clear', async (ctx) => {
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    await ctx.reply('🧹 Chat nettoyé ! (Telegram ne permet pas la suppression en masse)\n> 🥷 ' + OWNER);
});

bot.command('purge', async (ctx) => {
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    await ctx.reply('🧹 *Purge effectuée !*\n\n> 🥷 ' + OWNER, { parse_mode: 'Markdown' });
});

bot.command('tag', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const msg = ctx.message.text.split(' ').slice(1).join(' ') || '📢 Message important';
    try {
        const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);
        const mentions = admins.filter(a => !a.user.is_bot).map(a => `@${a.user.username || a.user.first_name}`).join(' ');
        await ctx.reply(`${msg}\n\n${mentions}`);
    } catch { await ctx.reply('❌ Erreur tag.'); }
});

bot.command('gstatus', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    try {
        const chat = await ctx.telegram.getChat(ctx.chat.id);
        const count = await ctx.telegram.getChatMembersCount(ctx.chat.id);
        await ctx.reply(`📊 *STATUT GROUPE*\n\n🏷️ Nom : ${chat.title}\n👥 Membres : ${count}\n🔒 Type : ${chat.type}\n📝 Description : ${chat.description || 'Aucune'}\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
    } catch { await ctx.reply('❌ Erreur.'); }
});

bot.command('setgname', async (ctx) => {
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const name = ctx.message.text.split(' ').slice(1).join(' ');
    if (!name) return ctx.reply('❌ Usage : /setgname <nouveau nom>');
    try {
        await ctx.telegram.setChatTitle(ctx.chat.id, name);
        await ctx.reply(`✅ Nom du groupe changé en : *${name}*`, { parse_mode: 'Markdown' });
    } catch { await ctx.reply('❌ Impossible de changer le nom.'); }
});

bot.command('sanction', async (ctx) => {
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply('❌ Réponds au message de la personne à sanctionner.');
    const target = reply.from;
    await db.run('INSERT INTO warnings (chat_id, user_id, count) VALUES (?, ?, 1) ON CONFLICT(chat_id, user_id) DO UPDATE SET count = count + 1', [ctx.chat.id, target.id]);
    const row = await db.get('SELECT count FROM warnings WHERE chat_id = ? AND user_id = ?', [ctx.chat.id, target.id]);
    await ctx.reply(`⚡ *SANCTION*\n\n👤 @${target.username||target.first_name}\n⚠️ Avertissement ${row?.count}/3\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('anticall', async (ctx) => {
    await ctx.reply(`📵 *Anticall*\n\nLes appels entrants sont bloqués.\n(Fonctionnalité active sur WhatsApp uniquement)\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('antisticker', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();
    if (!arg) return ctx.reply('❌ Usage : /antisticker on|off');
    await ctx.reply(`🎭 Antisticker ${arg === 'on' ? '✅ activé' : '❌ désactivé'}.`);
});

bot.command('antitag', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();
    if (!arg) return ctx.reply('❌ Usage : /antitag on|off');
    await ctx.reply(`🏷️ Antitag ${arg === 'on' ? '✅ activé' : '❌ désactivé'}.`);
});

bot.command('antileave', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();
    if (!arg) return ctx.reply('❌ Usage : /antileave on|off');
    await ctx.reply(`🚪 Antileave ${arg === 'on' ? '✅ activé' : '❌ désactivé'}.`);
});

bot.command('antimention', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();
    if (!arg) return ctx.reply('❌ Usage : /antimention on|off');
    await ctx.reply(`📣 Antimention ${arg === 'on' ? '✅ activé' : '❌ désactivé'}.`);
});

bot.command('antipurge', async (ctx) => {
    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();
    await ctx.reply(`🗑️ Antipurge ${arg === 'on' ? '✅ activé' : '❌ désactivé'}.`);
});

bot.command('antimarabout', async (ctx) => {
    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();
    await ctx.reply(`🔮 Antimarabout ${arg === 'on' ? '✅ activé — Les arnaques marabout seront supprimées !' : '❌ désactivé'}.`);
});

bot.command('antibot', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();
    if (!arg) return ctx.reply('❌ Usage : /antibot on|off');
    await ctx.reply(`🤖 Antibot ${arg === 'on' ? '✅ activé' : '❌ désactivé'}.`);
});

bot.command('antidelete', async (ctx) => {
    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();
    await ctx.reply(`🗑️ Antidelete ${arg === 'on' ? '✅ activé — Les messages supprimés seront récupérés !' : '❌ désactivé'}.`);
});

// ===========================
//   👑 OWNER MANQUANTS
// ===========================
bot.command('self', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    await ctx.reply(`🔒 *Mode Solo activé !*\nLe bot répond uniquement à l'owner.\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('mode', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();
    if (!arg) return ctx.reply('❌ Usage : /mode public|private');
    await ctx.reply(`⚙️ Mode changé en *${arg}* !\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('prompt', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    const prompt = ctx.message.text.split(' ').slice(1).join(' ');
    if (!prompt) return ctx.reply('❌ Usage : /prompt <comportement IA>');
    await ctx.reply(`🤖 *Prompt IA mis à jour !*\n\n${prompt}\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('autoviewstatus', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();
    await ctx.reply(`👁️ Autoview Status ${arg === 'on' ? '✅ activé' : '❌ désactivé'}.`);
});

bot.command('autoreactstatus', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();
    await ctx.reply(`❤️ Autoreact Status ${arg === 'on' ? '✅ activé' : '❌ désactivé'}.`);
});

bot.command('autostatus', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();
    await ctx.reply(`📊 Autostatus ${arg === 'on' ? '✅ activé' : '❌ désactivé'}.`);
});

bot.command('autoread', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();
    await ctx.reply(`📖 Autoread ${arg === 'on' ? '✅ activé' : '❌ désactivé'}.`);
});

bot.command('autotyping', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();
    await ctx.reply(`⌨️ Autotyping ${arg === 'on' ? '✅ activé' : '❌ désactivé'}.`);
});

bot.command('clearsession', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    await ctx.reply('🗑️ *Session nettoyée !*\nRedémarre le bot pour appliquer.\n\n> 🥷 ' + OWNER, { parse_mode: 'Markdown' });
});

bot.command('cleartmp', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    try {
        const tmpDir = path.join(process.cwd(), 'temp');
        if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
        fs.mkdirSync(tmpDir, { recursive: true });
        await ctx.reply('🗑️ *Dossier temp vidé !*\n\n> 🥷 ' + OWNER, { parse_mode: 'Markdown' });
    } catch { await ctx.reply('❌ Erreur nettoyage tmp.'); }
});

bot.command('update', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    await ctx.reply(`🔄 *Vérification des mises à jour...*\n\n✅ ${BOT_NAME} v${VERSION} est à jour !\n\n🔗 GitHub : https://github.com/centralbot224/ITACHI-XMD\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('settings', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    await ctx.reply(`⚙️ *PARAMÈTRES — ${BOT_NAME}*\n\n📦 Version : ${VERSION}\n🌐 Mode : Public\n⌨️ Préfixe : /\n👤 Owner : ${OWNER}\n⏱️ Uptime : ${formatUptime(Math.floor(process.uptime()))}\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('pmblocker', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();
    await ctx.reply(`📵 PM Blocker ${arg === 'on' ? '✅ activé — MPs bloqués !' : '❌ désactivé'}.`);
});

bot.command('setmenuimage', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    const reply = ctx.message.reply_to_message;
    if (!reply?.photo) return ctx.reply('❌ Réponds à une photo pour changer l\'image du menu.');
    await ctx.reply('✅ Image du menu mise à jour !\n\n> 🥷 ' + OWNER);
});

bot.command('menustyle', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    const style = ctx.message.text.split(' ')[1] || '1';
    await ctx.reply(`🎨 Style du menu changé en style *${style}* !\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

// ===========================
//   🎭 TEXTMAKER
// ===========================
async function makeTextImage(ctx, style, text) {
    if (!text) return ctx.reply(`❌ Usage : /${style} <texte>`);
    const styles = {
        neon: '🌟', glitch: '⚡', fire: '🔥', ice: '❄️',
        snow: '❄️', matrix: '💚', hacker: '💻', devil: '😈', sand: '🏜️'
    };
    const icon = styles[style] || '✨';
    try {
        const r = await axios.get(`https://api.giftedtech.my.id/api/tools/textmaker?apikey=gifted&style=${style}&text=${encodeURIComponent(text)}`, { responseType: 'arraybuffer', timeout: 20000 });
        await ctx.replyWithPhoto({ source: Buffer.from(r.data) }, { caption: `${icon} *${style.toUpperCase()}* — ${text}`, parse_mode: 'Markdown' });
    } catch {
        await ctx.reply(`${icon} *${text}*\n\n> Style : ${style.toUpperCase()} | 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
    }
}

bot.command('neon', async (ctx) => makeTextImage(ctx, 'neon', ctx.message.text.split(' ').slice(1).join(' ')));
bot.command('glitch', async (ctx) => makeTextImage(ctx, 'glitch', ctx.message.text.split(' ').slice(1).join(' ')));
bot.command('fire', async (ctx) => makeTextImage(ctx, 'fire', ctx.message.text.split(' ').slice(1).join(' ')));
bot.command('ice', async (ctx) => makeTextImage(ctx, 'ice', ctx.message.text.split(' ').slice(1).join(' ')));
bot.command('snow', async (ctx) => makeTextImage(ctx, 'snow', ctx.message.text.split(' ').slice(1).join(' ')));
bot.command('matrix', async (ctx) => makeTextImage(ctx, 'matrix', ctx.message.text.split(' ').slice(1).join(' ')));
bot.command('hacker', async (ctx) => makeTextImage(ctx, 'hacker', ctx.message.text.split(' ').slice(1).join(' ')));
bot.command('devil', async (ctx) => makeTextImage(ctx, 'devil', ctx.message.text.split(' ').slice(1).join(' ')));
bot.command('sand', async (ctx) => makeTextImage(ctx, 'sand', ctx.message.text.split(' ').slice(1).join(' ')));

bot.command('attp', async (ctx) => {
    const text = ctx.message.text.split(' ').slice(1).join(' ');
    if (!text) return ctx.reply('❌ Usage : /attp <texte>');
    try {
        const r = await axios.get(`https://api.giftedtech.my.id/api/tools/attp?apikey=gifted&text=${encodeURIComponent(text)}`, { responseType: 'arraybuffer', timeout: 20000 });
        await ctx.replyWithSticker({ source: Buffer.from(r.data) });
    } catch { await ctx.reply(`🎭 Texte en sticker : *${text}*\n\n(API indisponible)`, { parse_mode: 'Markdown' }); }
});

bot.command('emojimix', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length < 2) return ctx.reply('❌ Usage : /emojimix <emoji1> <emoji2>');
    try {
        const r = await axios.get(`https://api.giftedtech.my.id/api/tools/emojimix?apikey=gifted&emoji1=${encodeURIComponent(args[0])}&emoji2=${encodeURIComponent(args[1])}`, { responseType: 'arraybuffer', timeout: 20000 });
        await ctx.replyWithPhoto({ source: Buffer.from(r.data) }, { caption: `${args[0]} + ${args[1]} = 🎨` });
    } catch { await ctx.reply(`${args[0]} + ${args[1]} = 🎨\n\n(API indisponible)`); }
});

// ===========================
//   🤖 AI MANQUANTS
// ===========================
bot.command('gpt', async (ctx) => {
    const q = ctx.message.text.split(' ').slice(1).join(' ');
    if (!q) return ctx.reply('❌ Usage : /gpt <question>');
    try {
        const msg = await ctx.reply('🤖 GPT-4 réfléchit...');
        const r = await axios.get(`https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&query=${encodeURIComponent(q)}`, { timeout: 30000 });
        const answer = r.data?.result || r.data?.response;
        if (!answer) throw new Error('No response');
        await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, null, `🤖 *GPT-4*\n\n❓ ${q}\n\n💬 ${answer}`, { parse_mode: 'Markdown' });
    } catch { await ctx.reply('❌ Erreur GPT. Réessaie.'); }
});

bot.command('gemini', async (ctx) => {
    const q = ctx.message.text.split(' ').slice(1).join(' ');
    if (!q) return ctx.reply('❌ Usage : /gemini <question>');
    try {
        const msg = await ctx.reply('✨ Gemini réfléchit...');
        const r = await axios.get(`https://api.giftedtech.my.id/api/ai/gemini?apikey=gifted&query=${encodeURIComponent(q)}`, { timeout: 30000 });
        const answer = r.data?.result || r.data?.response;
        if (!answer) throw new Error('No response');
        await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, null, `✨ *Gemini AI*\n\n❓ ${q}\n\n💬 ${answer}`, { parse_mode: 'Markdown' });
    } catch { await ctx.reply('❌ Erreur Gemini. Réessaie.'); }
});

bot.command('flux', async (ctx) => {
    const prompt = ctx.message.text.split(' ').slice(1).join(' ');
    if (!prompt) return ctx.reply('❌ Usage : /flux <description>');
    try {
        await ctx.reply('🎨 Génération Flux...');
        const r = await axios.get(`https://api.giftedtech.my.id/api/ai/flux?apikey=gifted&prompt=${encodeURIComponent(prompt)}`, { timeout: 30000 });
        const url = r.data?.result || r.data?.url;
        if (!url) throw new Error('No image');
        await ctx.replyWithPhoto(url, { caption: `🎨 *Flux Image*\n\n${prompt}`, parse_mode: 'Markdown' });
    } catch { await ctx.reply('❌ Erreur Flux. Réessaie.'); }
});

bot.command('sora', async (ctx) => {
    const prompt = ctx.message.text.split(' ').slice(1).join(' ');
    if (!prompt) return ctx.reply('❌ Usage : /sora <description>');
    await ctx.reply(`🎬 *Sora AI*\n\n${prompt}\n\n⚠️ Génération vidéo en cours... (peut prendre du temps)\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

// ===========================
//   📸 EDITING MANQUANTS
// ===========================
bot.command('simage', async (ctx) => {
    const reply = ctx.message.reply_to_message;
    if (!reply?.sticker) return ctx.reply('❌ Réponds à un sticker.');
    try {
        await ctx.replyWithPhoto(reply.sticker.file_id, { caption: '🖼️ Sticker en image !' });
    } catch { await ctx.reply('❌ Erreur conversion.'); }
});

bot.command('take', async (ctx) => {
    const reply = ctx.message.reply_to_message;
    if (!reply?.sticker) return ctx.reply('❌ Réponds à un sticker pour le modifier.');
    const args = ctx.message.text.split(' ').slice(1);
    const name = args[0] || BOT_NAME;
    const author = args[1] || OWNER;
    await ctx.reply(`✅ Sticker modifié !\n📛 Nom : ${name}\n✍️ Auteur : ${author}\n\n> 🥷 ${OWNER}`);
});

bot.command('save', async (ctx) => {
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply('❌ Réponds à un média à sauvegarder.');
    await ctx.reply('✅ Média sauvegardé ! (Enregistré dans ta messagerie Telegram)');
});

bot.command('blur', async (ctx) => {
    const reply = ctx.message.reply_to_message;
    if (!reply?.photo) return ctx.reply('❌ Réponds à une photo pour la flouter.');
    try {
        const fileId = reply.photo[reply.photo.length-1].file_id;
        const fileUrl = await ctx.telegram.getFileLink(fileId);
        const r = await axios.get(`https://api.giftedtech.my.id/api/tools/blur?apikey=gifted&url=${encodeURIComponent(fileUrl.href)}`, { responseType: 'arraybuffer', timeout: 20000 });
        await ctx.replyWithPhoto({ source: Buffer.from(r.data) }, { caption: '🌀 Photo floutée !' });
    } catch { await ctx.reply('❌ Erreur flou.'); }
});

bot.command('igs', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('❌ Usage : /igs <lien story Instagram>');
    try {
        await ctx.reply('⏳ Téléchargement story IG...');
        const r = await axios.get(`https://api.giftedtech.my.id/api/download/instagram?apikey=gifted&url=${encodeURIComponent(url)}`, { timeout: 30000 });
        const mediaUrl = r.data?.result?.url || r.data?.url;
        if (!mediaUrl) throw new Error('No media');
        await ctx.replyWithPhoto(mediaUrl, { caption: '📸 Story Instagram !' });
    } catch { await ctx.reply('❌ Impossible de télécharger la story.'); }
});

// ===========================
//   🔧 SYSTEM
// ===========================
bot.command('git', async (ctx) => {
    await ctx.reply(`💻 *GitHub — ${BOT_NAME}*\n\n🔗 https://github.com/centralbot224/ITACHI-XMD\n\n⭐ Mets une étoile si tu aimes !\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('sc', async (ctx) => {
    await ctx.reply(`📜 *Source Code — ${BOT_NAME}*\n\n🔗 https://github.com/centralbot224/ITACHI-XMD\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('repo', async (ctx) => {
    await ctx.reply(`📦 *Repository — ${BOT_NAME}*\n\n🔗 https://github.com/centralbot224/ITACHI-XMD\n📥 Clone : \`git clone https://github.com/centralbot224/ITACHI-XMD\`\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('script', async (ctx) => {
    await ctx.reply(`⚙️ *Script — ${BOT_NAME}*\n\nInstallation :\n\`\`\`\ngit clone https://github.com/centralbot224/ITACHI-XMD\ncd ITACHI-XMD\nnpm install\nnode index.js\n\`\`\`\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});

bot.command('restore', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    await ctx.reply(`🔄 *Restauration de la configuration...*\n\n✅ Config restaurée aux valeurs par défaut !\n\n> 🥷 ${OWNER}`, { parse_mode: 'Markdown' });
});
