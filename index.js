/*
 * 🥷 ITACHI-XMD — BOT TELEGRAM v2.0
 * Owner : IBRAHIMA SORY SACKO
 * Communauté : CENTRAL-HEX 💎
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ===== AUTO INSTALL =====
const deps = ['telegraf', 'sqlite3', 'sqlite', 'axios'];
let ok = true;
for (const d of deps) { try { require.resolve(d); } catch { ok = false; break; } }
if (!ok) {
    console.log('📦 Installation des dépendances...');
    try {
        execSync('npm init -y', { stdio: 'ignore' });
        execSync(`npm install ${deps.join(' ')}`, { stdio: 'inherit' });
    } catch { console.error('❌ Erreur installation.'); process.exit(1); }
}

const { Telegraf, Markup } = require('telegraf');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// ===== CONFIG =====
const BOT_TOKEN = '8623448257:AAF8NZuhSJPWkkiXtpPDcbjUbQPiYCRf4vM';  // ← BotFather token
const ADMIN_ID  = 5838309886;          // ← Ton ID Telegram
const VERSION   = '2.0.0';
const BOT_NAME  = 'ITACHI-XMD';
const OWNER     = 'IBSACKO™';
const BOT_IMAGE = 'https://i.ibb.co/zTpCpsDD/54c381553462489288313ec73a0bbfe8.jpg';

const bot = new Telegraf(BOT_TOKEN);

// ===== UTILS =====
function formatUptime(s) {
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    return `${d > 0 ? d + 'j ' : ''}${h}h ${m}m`;
}
function bar(pct, len = 10) {
    const f = Math.min(len, Math.round((pct / 100) * len));
    return '▓'.repeat(f) + '░'.repeat(len - f);
}
function isOwner(ctx) { return ctx.from.id === ADMIN_ID; }
async function isChatAdmin(ctx, userId) {
    try {
        const m = await ctx.telegram.getChatMember(ctx.chat.id, userId);
        return ['administrator', 'creator'].includes(m.status);
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
        CREATE TABLE IF NOT EXISTS welcome (chat_id INTEGER PRIMARY KEY, enabled INTEGER DEFAULT 1, message TEXT);
        CREATE TABLE IF NOT EXISTS muted (chat_id INTEGER PRIMARY KEY, enabled INTEGER DEFAULT 0);
        CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, action TEXT, date TEXT);
    `);
}

async function registerUser(ctx) {
    const u = ctx.from;
    try { await db.run('INSERT OR IGNORE INTO users (user_id, username, first_name, join_date) VALUES (?, ?, ?, datetime("now"))', [u.id, u.username || 'none', u.first_name || '']); } catch {}
}
async function logAction(userId, action) {
    try { await db.run('INSERT INTO logs (user_id, action, date) VALUES (?, ?, datetime("now"))', [userId, action]); } catch {}
}

// ===== /START =====
bot.start(async (ctx) => {
    await registerUser(ctx);
    await logAction(ctx.from.id, '/start');
    const name = ctx.from.first_name || 'Opérateur';
    await ctx.replyWithPhoto(BOT_IMAGE, {
        caption: `┏━━━━━━━━━━━━━━━━━━━━━━┓\n┃  🥷 ${BOT_NAME} v${VERSION} 🥷  ┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n👋 Bienvenue ${name} !\n\n🤖 Bot développé par CENTRAL-HEX\n👑 Owner : ${OWNER}\n\n✅ Tu es maintenant enregistré.\n💡 Tape .menu pour voir toutes les commandes.\n\n> Propulsé par 🥷 IBSACKO™ · CENTRAL-HEX`,
        ...Markup.inlineKeyboard([
            [Markup.button.callback('📊 Mon Profil', 'profile'), Markup.button.callback('📖 Menu', 'menu_btn')],
            [Markup.button.callback('📈 Stats', 'stats_btn'), Markup.button.callback('ℹ️ About', 'about')],
            [Markup.button.url('💎 CENTRAL-HEX', 'https://whatsapp.com/channel/0029VbC8YkY7oQhiOiiSpy1z')]
        ])
    });
});

// ===== .menu =====
bot.hears(/^\.menu$/i, async (ctx) => {
    await registerUser(ctx);
    await ctx.replyWithPhoto(BOT_IMAGE, {
        caption: `┏━━━━━━━━━━━━━━━━━━━━━━┓\n┃  🥷 ${BOT_NAME} v${VERSION} 🥷  ┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n📋 MENU PRINCIPAL\n━━━━━━━━━━━━━━━━━━━━━━\n\n👤 INFO\n│ ⬡ .ping → latence & stats\n│ ⬡ .alive → statut bot\n│ ⬡ .profil → ton profil\n\n🛡️ MODÉRATION GROUPE\n│ ⬡ .kick → expulser\n│ ⬡ .ban → bannir\n│ ⬡ .unban @user → débannir\n│ ⬡ .warn → avertir (3=ban)\n│ ⬡ .warnings → voir warns\n│ ⬡ .promote → rendre admin\n│ ⬡ .demote → retirer admin\n│ ⬡ .mute → muter groupe\n│ ⬡ .unmute → démuter\n│ ⬡ .tagall → mentionner tous\n│ ⬡ .signal → signaler user\n\n🔐 PROTECTION\n│ ⬡ .antilink on/off\n│ ⬡ .welcome on/off\n\n👑 ADMIN\n│ ⬡ .broadcast <msg>\n\n> Propulsé par 🥷 ${OWNER} · CENTRAL-HEX`,
    });
});

// ===== .ping =====
bot.hears(/^\.ping$/i, async (ctx) => {
    const start = Date.now();
    const msg = await ctx.reply('⏱️ Calcul...');
    const ping = Date.now() - start;
    const ramUsed = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const ramTotal = (os.totalmem() / 1024 / 1024).toFixed(0);
    const ramPct = ((process.memoryUsage().rss / os.totalmem()) * 100).toFixed(0);
    const cpu = os.loadavg()[0].toFixed(2);
    const icon = ping < 100 ? '🟢' : ping < 300 ? '🟡' : '🔴';
    await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, null,
`┏━━━━━━━━━━━━━━━━━━━━━━┓
┃  🥷 ${BOT_NAME} v${VERSION} 🥷  ┃
┗━━━━━━━━━━━━━━━━━━━━━━┛

${icon} Ping     : ${ping} ms
⏱️ Uptime   : ${formatUptime(Math.floor(process.uptime()))}
📦 Version  : v${VERSION}
🌐 Node.js  : ${process.version}

💾 RAM — ${ramUsed}/${ramTotal} MB
[${bar(parseInt(ramPct))}] ${ramPct}%

🖥️ CPU : ${cpu} | OS : ${os.platform()}

> Propulsé par 🥷 ${OWNER}`);
});

// ===== .alive =====
bot.hears(/^\.alive$/i, async (ctx) => {
    await ctx.replyWithPhoto(BOT_IMAGE, {
        caption: `┏━━━━━━━━━━━━━━━━━━━━━━┓\n┃  🥷 ${BOT_NAME} v${VERSION} 🥷  ┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n💚 OUI JE SUIS VIVANT !\n━━━━━━━━━━━━━━━━━━━━━━\n✅ Statut   : En ligne\n⏱️ Uptime   : ${formatUptime(Math.floor(process.uptime()))}\n📦 Version  : v${VERSION}\n👤 Owner    : ${OWNER}\n💾 RAM      : ${(process.memoryUsage().rss/1024/1024).toFixed(1)} MB\n\n🛡️ Fonctions actives :\n⬡ Modération groupe\n⬡ Antilink & Welcome\n⬡ Warn / Kick / Ban\n⬡ Tagall & Signal\n⬡ Broadcast admin\n\n> Propulsé par 🥷 ${OWNER}`
    });
});

// ===== .profil =====
bot.hears(/^\.profil$/i, async (ctx) => {
    await registerUser(ctx);
    const u = await db.get('SELECT * FROM users WHERE user_id = ?', [ctx.from.id]);
    const w = await db.get('SELECT count FROM warnings WHERE chat_id = ? AND user_id = ?', [ctx.chat.id, ctx.from.id]);
    await ctx.reply(`👤 TON PROFIL — ${BOT_NAME}\n\n🆔 ID        : ${ctx.from.id}\n📝 Username  : @${ctx.from.username || 'aucun'}\n📅 Inscrit   : ${u?.join_date || 'Inconnu'}\n⚠️ Warnings  : ${w?.count || 0}/3\n\n> Propulsé par 🥷 ${OWNER}`);
});

// ===== .warn =====
bot.hears(/^\.warn$/i, async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply('❌ Réponds au message de la personne à avertir.');
    const target = reply.from;
    await db.run('INSERT INTO warnings (chat_id, user_id, count) VALUES (?, ?, 1) ON CONFLICT(chat_id, user_id) DO UPDATE SET count = count + 1', [ctx.chat.id, target.id]);
    const row = await db.get('SELECT count FROM warnings WHERE chat_id = ? AND user_id = ?', [ctx.chat.id, target.id]);
    const count = row?.count || 1;
    await ctx.reply(`⚠️ WARNING\n\n👤 Averti : @${target.username || target.first_name}\n⚠️ Warnings : ${count}/3\n👑 Par : @${ctx.from.username || ctx.from.first_name}\n📅 ${new Date().toLocaleString()}`);
    if (count >= 3) {
        try {
            await ctx.telegram.banChatMember(ctx.chat.id, target.id);
            await db.run('DELETE FROM warnings WHERE chat_id = ? AND user_id = ?', [ctx.chat.id, target.id]);
            await ctx.reply(`🚫 @${target.username || target.first_name} banni après 3 warnings !`);
        } catch { await ctx.reply('❌ Impossible de bannir. Vérifie les droits du bot.'); }
    }
});

// ===== .warnings =====
bot.hears(/^\.warnings$/i, async (ctx) => {
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply('❌ Réponds au message de la personne.');
    const target = reply.from;
    const row = await db.get('SELECT count FROM warnings WHERE chat_id = ? AND user_id = ?', [ctx.chat.id, target.id]);
    await ctx.reply(`⚠️ @${target.username || target.first_name} a ${row?.count || 0}/3 warnings.`);
});

// ===== .kick =====
bot.hears(/^\.kick$/i, async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply('❌ Réponds au message de la personne à expulser.');
    try {
        await ctx.telegram.banChatMember(ctx.chat.id, reply.from.id);
        await ctx.telegram.unbanChatMember(ctx.chat.id, reply.from.id);
        await ctx.reply(`✅ @${reply.from.username || reply.from.first_name} expulsé.`);
    } catch { await ctx.reply('❌ Impossible d\'expulser.'); }
});

// ===== .ban =====
bot.hears(/^\.ban$/i, async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply('❌ Réponds au message de la personne à bannir.');
    try {
        await ctx.telegram.banChatMember(ctx.chat.id, reply.from.id);
        await ctx.reply(`🚫 @${reply.from.username || reply.from.first_name} banni.`);
    } catch { await ctx.reply('❌ Impossible de bannir.'); }
});

// ===== .unban =====
bot.hears(/^\.unban (.+)$/i, async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply('❌ Réponds au message de la personne à débannir.');
    try {
        await ctx.telegram.unbanChatMember(ctx.chat.id, reply.from.id);
        await ctx.reply(`✅ @${reply.from.username || reply.from.first_name} débanni.`);
    } catch { await ctx.reply('❌ Impossible de débannir.'); }
});

// ===== .promote =====
bot.hears(/^\.promote$/i, async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply('❌ Réponds au message de la personne.');
    try {
        await ctx.telegram.promoteChatMember(ctx.chat.id, reply.from.id, {
            can_change_info: true, can_delete_messages: true,
            can_invite_users: true, can_restrict_members: true, can_pin_messages: true
        });
        await ctx.reply(`👑 @${reply.from.username || reply.from.first_name} est maintenant admin !`);
    } catch { await ctx.reply('❌ Impossible de promouvoir.'); }
});

// ===== .demote =====
bot.hears(/^\.demote$/i, async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply('❌ Réponds au message de la personne.');
    try {
        await ctx.telegram.promoteChatMember(ctx.chat.id, reply.from.id, {
            can_change_info: false, can_delete_messages: false,
            can_invite_users: false, can_restrict_members: false, can_pin_messages: false
        });
        await ctx.reply(`⬇️ @${reply.from.username || reply.from.first_name} n'est plus admin.`);
    } catch { await ctx.reply('❌ Impossible de rétrograder.'); }
});

// ===== .mute / .unmute =====
bot.hears(/^\.mute$/i, async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    await db.run('INSERT OR REPLACE INTO muted (chat_id, enabled) VALUES (?, 1)', [ctx.chat.id]);
    await ctx.reply('🔇 Groupe muté. Seuls les admins peuvent écrire.');
});
bot.hears(/^\.unmute$/i, async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    await db.run('INSERT OR REPLACE INTO muted (chat_id, enabled) VALUES (?, 0)', [ctx.chat.id]);
    await ctx.reply('🔊 Groupe démuté.');
});

// ===== .tagall =====
bot.hears(/^\.tagall(.*)$/i, async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const customMsg = ctx.match[1]?.trim() || '📢 Attention tout le monde !';
    try {
        const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);
        const mentions = admins.filter(a => !a.user.is_bot).map(a => `@${a.user.username || a.user.first_name}`).join(' ');
        await ctx.reply(`${customMsg}\n\n${mentions}`);
    } catch { await ctx.reply('❌ Impossible de taguer.'); }
});

// ===== .signal =====
bot.hears(/^\.signal$/i, async (ctx) => {
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply('❌ Réponds au message de la personne à signaler.');
    const target = reply.from;
    await ctx.reply(`🚨 Signalement de @${target.username || target.first_name} envoyé à l'admin !`);
    try {
        await ctx.telegram.forwardMessage(ADMIN_ID, ctx.chat.id, reply.message_id);
        await ctx.telegram.sendMessage(ADMIN_ID, `🚨 SIGNALEMENT\n\n👤 Cible : @${target.username || target.first_name} (ID: ${target.id})\n👤 Par : @${ctx.from.username || ctx.from.first_name}\n💬 Chat : ${ctx.chat.title || 'Privé'}`);
    } catch {}
});

// ===== .antilink =====
bot.hears(/^\.antilink (on|off)$/i, async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const enabled = ctx.match[1].toLowerCase() === 'on' ? 1 : 0;
    await db.run('INSERT OR REPLACE INTO antilink (chat_id, enabled) VALUES (?, ?)', [ctx.chat.id, enabled]);
    await ctx.reply(`🔐 Antilink ${enabled ? '✅ activé' : '❌ désactivé'}.`);
});

// ===== .welcome =====
bot.hears(/^\.welcome (on|off)$/i, async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Groupe uniquement.');
    if (!await isChatAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins seulement.');
    const enabled = ctx.match[1].toLowerCase() === 'on' ? 1 : 0;
    await db.run('INSERT OR REPLACE INTO welcome (chat_id, enabled) VALUES (?, ?)', [ctx.chat.id, enabled]);
    await ctx.reply(`👋 Welcome ${enabled ? '✅ activé' : '❌ désactivé'}.`);
});

// ===== .broadcast =====
bot.hears(/^\.broadcast (.+)$/is, async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner seulement.');
    const msg = ctx.match[1].trim();
    const users = await db.all('SELECT user_id FROM users');
    let sent = 0;
    for (const u of users) {
        try {
            await ctx.telegram.sendMessage(u.user_id, `📢 Message Admin — ${BOT_NAME}\n\n${msg}\n\n> 🥷 ${OWNER}`);
            sent++;
        } catch {}
    }
    await ctx.reply(`✅ Broadcast envoyé à ${sent}/${users.length} utilisateurs.`);
});

// ===== WELCOME / GOODBYE =====
bot.on('new_chat_members', async (ctx) => {
    try {
        const row = await db.get('SELECT enabled FROM welcome WHERE chat_id = ?', [ctx.chat.id]);
        if (row?.enabled === 0) return;
        for (const m of ctx.message.new_chat_members) {
            if (m.is_bot) continue;
            await ctx.reply(`👋 Bienvenue @${m.username || m.first_name} dans *${ctx.chat.title}* !\n\n🥷 Géré par ${BOT_NAME} · CENTRAL-HEX`, { parse_mode: 'Markdown' });
        }
    } catch {}
});

bot.on('left_chat_member', async (ctx) => {
    try {
        const m = ctx.message.left_chat_member;
        if (m.is_bot) return;
        await ctx.reply(`👋 Au revoir @${m.username || m.first_name} !\n🥷 ${BOT_NAME} · CENTRAL-HEX`);
    } catch {}
});

// ===== ANTILINK MIDDLEWARE =====
bot.on('message', async (ctx, next) => {
    if (ctx.chat.type === 'private') return next();
    try {
        const row = await db.get('SELECT enabled FROM antilink WHERE chat_id = ?', [ctx.chat.id]);
        if (row?.enabled) {
            const text = ctx.message?.text || ctx.message?.caption || '';
            if (/(https?:\/\/|t\.me\/|wa\.me\/)/i.test(text)) {
                if (!await isChatAdmin(ctx, ctx.from.id)) {
                    await ctx.deleteMessage();
                    await ctx.reply(`🚫 @${ctx.from.username || ctx.from.first_name} les liens sont interdits !`);
                    return;
                }
            }
        }
        const muted = await db.get('SELECT enabled FROM muted WHERE chat_id = ?', [ctx.chat.id]);
        if (muted?.enabled && !await isChatAdmin(ctx, ctx.from.id)) {
            await ctx.deleteMessage();
            return;
        }
    } catch {}
    return next();
});

// ===== STATS =====
bot.command('stats', async (ctx) => {
    const total = await db.get('SELECT COUNT(*) as n FROM users');
    await ctx.reply(`📊 STATS — ${BOT_NAME}\n\n👥 Utilisateurs : ${total?.n || 0}\n⏱️ Uptime : ${formatUptime(Math.floor(process.uptime()))}\n💾 RAM : ${(process.memoryUsage().rss/1024/1024).toFixed(1)} MB\n\n> 🥷 ${OWNER}`);
});

// ===== ADMIN PANEL =====
bot.command('admin', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Accès refusé.');
    const users = await db.all('SELECT * FROM users ORDER BY join_date DESC LIMIT 10');
    const total = await db.get('SELECT COUNT(*) as n FROM users');
    await ctx.reply(
`👑 ADMIN PANEL — ${BOT_NAME}

📊 Total Users : ${total?.n || 0}
⏱️ Uptime : ${formatUptime(Math.floor(process.uptime()))}

📋 Derniers users :
${users.map(u => `• ${u.first_name} (@${u.username})`).join('\n')}

💡 .broadcast <msg> pour envoyer à tous
> 🔐 ${OWNER}`
    );
});

// ===== INLINE BUTTONS =====
bot.action('profile', async (ctx) => {
    await ctx.answerCbQuery();
    const u = await db.get('SELECT * FROM users WHERE user_id = ?', [ctx.from.id]);
    await ctx.editMessageText(`👤 PROFIL — ${BOT_NAME}\n\n🆔 ID : ${ctx.from.id}\n📝 Username : @${ctx.from.username || 'aucun'}\n📅 Inscrit : ${u?.join_date || 'Inconnu'}\n\n> 🥷 ${OWNER}`);
});
bot.action('menu_btn', async (ctx) => { await ctx.answerCbQuery(); await ctx.reply('💡 Tape .menu pour voir toutes les commandes !'); });
bot.action('stats_btn', async (ctx) => {
    await ctx.answerCbQuery();
    const total = await db.get('SELECT COUNT(*) as n FROM users');
    await ctx.editMessageText(`📊 STATS — ${BOT_NAME}\n\n👥 Users : ${total?.n || 0}\n⏱️ Uptime : ${formatUptime(Math.floor(process.uptime()))}\n💾 RAM : ${(process.memoryUsage().rss/1024/1024).toFixed(1)} MB\n\n> 🥷 ${OWNER}`);
});
bot.action('about', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(`🤖 ${BOT_NAME} v${VERSION}\n\n👨‍💻 Dev : CENTRAL-HEX\n👑 Owner : ${OWNER}\n🛠️ Framework : Telegraf + SQLite\n\n> 🥷 IBSACKO™`);
});

// ===== ERREUR =====
bot.catch((err) => { console.error('Bot error:', err.message); });

// ===== DÉMARRAGE =====
async function startBot() {
    await initDB();
    await bot.launch();
    console.log('╔══════════════════════════════╗');
    console.log('║  🥷 ITACHI-XMD TELEGRAM v2.0 ║');
    console.log('║  Owner : IBSACKO™ CENTRAL-HEX║');
    console.log('║  Status : ✅ ONLINE           ║');
    console.log('╚══════════════════════════════╝');
}

startBot().catch(err => { console.error('❌ Erreur:', err.message); process.exit(1); });
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
