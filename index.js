/*  WOCKHARDT-BOT v2 – Bleed-style, KEYLESS + Railway-safe (no FFmpeg required by default)
Prefix: - | discord.js v14
✅ Commands: STAFF ONLY (Owner/Admin/Mods)
✅ PUBLIC EXCEPTION:
    -sip (gives PIC PERM role)

✅ Buttons: PUBLIC (verify button + color role buttons work for everyone)

✅ Auto delete after 5s:
    - user command messages
    - bot NON-EMBED messages
  (Embeds NEVER delete)

✅ Welcomes (ONLY 2 channels now):
  #1 ORIGINAL welcome (role rotation purple/red + matching gif + buttons) -> WELCOME_CH
  #2 SECOND welcome (NO GIF • right-side user avatar • member count + date/time • color rotation green/orange/red/purple) -> WELCOME_CH_2

✅ Tests (forced) — STAY THE SAME:
  -testwelcome1 => forced RED welcome #1
  -testwelcome2 => forced PURPLE welcome #1
  -testwelcome3 => welcome #3 (color rotates) (TEST ONLY, not auto-sent)

✅ Extra:
  -sip => gives PIC PERM role (PUBLIC)
  -verifycam => sends the orange cam/selfie verify embed (emoji <:omgdghhg:1451163968377978902> only)

✅ Color Roles Panel:
  -colors / -testcolors => posts luxury Color Roles embed + buttons
  Buttons auto-swap (one color at a time)
  NO embed color bar (no .setColor on color panel)

*/
require("dotenv").config();
const {
Client,
GatewayIntentBits,
Partials,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
PermissionsBitField,
ChannelType,
} = require("discord.js");
const ms = require("ms");
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
/* ---------- CONFIG ---------- */
const PREFIX = "-";
/* ✅ NEW SERVER + ONLY 2 WELCOME CHANNELS */
const GUILD_ID = process.env.GUILD_ID || "1344613713608708168";
const WELCOME_CH = process.env.WELCOME_CH || "1411843153090183259"; // Welcome #1
const WELCOME_CH_2 = process.env.WELCOME_CH_2 || "1381307499461869659"; // Welcome #2
const VERIFY_CH = process.env.VERIFY_CH || "1439034515052957918";
/* ✅ Idle VC N/A (leave voice off) */
const IDLE_VC_ID = process.env.IDLE_VC_ID || "";
/* ✅ NEW ROLES */
const PURPLE_ROLE = process.env.PURPLE_ROLE || "1451496839344951339";
const RED_ROLE = process.env.RED_ROLE || "1451496910165774398";
const PIC_PERM_ROLE = process.env.PIC_PERM_ROLE || "1451151326795927755";
/* ✅ Verified role ID (more reliable than name) */
const VERIFIED_ROLE_ID = process.env.VERIFIED || "1439037116695969944";
const TOKEN = process.env.TOKEN;
// staff lock
const OWNER_ID = process.env.OWNER_ID || ""; // your discord user id
const MOD_ROLE_IDS = (process.env.MOD_ROLE_IDS || "")
.split(",")
.map((s) => s.trim())
.filter(Boolean);
if (!TOKEN) throw new Error("Missing TOKEN (set it in Railway Variables or .env)");
/* ---------- COLOR ROLES (ENV) ---------- */
const COLOR_ROLES = {
red: process.env.COLOR_ROLE_RED || "1375908139437654036",
orange: process.env.COLOR_ROLE_ORANGE || "1396585301845082162",
blue: process.env.COLOR_ROLE_BLUE || "1375908379469414480",
yellow: process.env.COLOR_ROLE_YELLOW || "1375908573707501658",
green: process.env.COLOR_ROLE_GREEN || "1375908478832607252",
purple: process.env.COLOR_ROLE_PURPLE || "1375908639671455907",
};
// your custom emojis
const COLOR_EMOJIS = {
red: "<:emoji_315:1451264887513682101>",
orange: "<:emoji_316:1451264991188488296>",
blue: "<:emoji_317:1451265073866870937>",
yellow: "<:emoji_318:1451265135007240225>",
green: "<:emoji_319:1451265183014977537>",
purple: "<:emoji_320:1451265302435205325>",
};
// your luxury header/banner image
const COLOR_HEADER_IMG =
"https://cdn.discordapp.com/attachments/1404284297992470638/1451286805042430184/409B68CC-DFEA-4A4A-B2C6-78664BA0DFEE.png";
const ENABLE_COLOR_CLEAR = true;
/* ---------- OPTIONAL VOICE (Railway-safe default OFF) ---------- */
const ENABLE_VOICE = String(process.env.ENABLE_VOICE || "false").toLowerCase() === "true";
// Only require voice if enabled.
let voice = null;
if (ENABLE_VOICE) {
try {
voice = require("@discordjs/voice");
} catch (e) {
console.warn("⚠️ ENABLE_VOICE=true but @discordjs/voice not available. Voice disabled.");
voice = null;
}
}
/* ---------- CLIENT ---------- */
const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildVoiceStates,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
],
partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User],
});
/* ---------- UTILS ---------- */
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
function autoDelete(msg, delay = 5000) {
if (!msg) return;
// ✅ do NOT delete embeds
if (msg.embeds && msg.embeds.length > 0) return;
setTimeout(() => msg.delete().catch(() => {}), delay);
}
function isStaff(m) {
if (!m?.guild || !m?.member) return false;
// owner
if (OWNER_ID && m.author.id === OWNER_ID) return true;
// admin
if (m.member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
// mod perms
if (
m.member.permissions.has(PermissionsBitField.Flags.ManageMessages) ||
m.member.permissions.has(PermissionsBitField.Flags.ModerateMembers) ||
m.member.permissions.has(PermissionsBitField.Flags.ManageGuild)
)
return true;
// optional mod roles list
if (MOD_ROLE_IDS.length && MOD_ROLE_IDS.some((id) => m.member.roles.cache.has(id))) return true;
return false;
}
/* ---------- 24/7 VC (OPTIONAL) ---------- */
async function joinIdleVC(guild) {
if (!voice) return;
if (!IDLE_VC_ID) return;
try {
const { joinVoiceChannel } = voice;
const vc = guild.channels.cache.get(IDLE_VC_ID);
if (!vc || (vc.type !== ChannelType.GuildVoice && vc.type !== ChannelType.GuildStageVoice)) return;

joinVoiceChannel({
  channelId: vc.id,
  guildId: guild.id,
  adapterCreator: guild.voiceAdapterCreator,
  selfDeaf: true,
  selfMute: false,
});

console.log("🎧 Joined idle VC (no audio):", vc.name);

} catch (e) {
console.warn("⚠️ Voice join failed.", e?.message);
}
}
/* ---------- EMBEDS ---------- */
function buildWelcomeEmbed(member, roleId, gif) {
const color = roleId === PURPLE_ROLE ? "#8A2BE2" : "#B00000";
return new EmbedBuilder()
.setTitle("𐌕𐌕・𝐖𝐎𝐂𝐊𝐇𝐀𝐑𝐃𝐓 𝘞𝘌𝘓𝘊𝘖𝘔𝘌 ✦")
.setDescription(
.setDescription(
  `Welcome to the Wock Zone, ${member}\n\n` +
  `✦ stay active\n` +
  `✦ inv 3 for perms\n` +
  `✦ -Sip for Pic Perms`
)
.setImage(gif)
.setColor(color)
.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 128 }))
.setTimestamp();
}
/* ✅ FIXED Welcome #2 (NO GIF, mention works, same thumbnail size always) */
function buildWelcomeEmbed2(member) {
const unix = Math.floor(Date.now() / 1000);
const mention = <@${member.id}>;
return new EmbedBuilder()
.setColor(rand(WELCOME3_COLORS)) // green / orange / red / purple
.setDescription(
[
welc to /††・𝐖𝐎𝐂𝐊𝐇𝐀𝐑𝐃𝐓 📣,
, `**Welcome ${mention} 🍇**`, ,
**${member.guild.memberCount} members** @ <t:${unix}:f>,
].join("\n")
)
.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 128 }));
// IMPORTANT: no .setTimestamp()
}
/* ✅ Welcome #3 (TEST ONLY) — simple style like your screenshot */
function buildWelcomeEmbed3(member) {
const unix = Math.floor(Date.now() / 1000);
return new EmbedBuilder()
.setColor(rand(WELCOME3_COLORS))
.setDescription(
[
welc to /††・𝐖𝐎𝐂𝐊𝐇𝐀𝐑𝐃𝐓 📣,
``,
**${member.guild.memberCount} members** @ <t:${unix}:F>,
].join("\n")
)
.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 128 }));
}
function buildVerifyEmbed() {
return new EmbedBuilder()
.setColor(0x8b00ff)
.setTitle("⛧ 𐌕𐌕・𝐖𝐎𝐂𝐊𝐇𝐀𝐑𝐃𝐓 ・ Verification ⛧")
.setDescription("Welcome, sipper.\nTap the button below to verify & unlock the rest of the server.")
.setImage("https://cdn.discordapp.com/attachments/1447035798930325574/1449276801405816995/IMG_4631.png")
.setFooter({ text: "Verification required • WOCKHARDT" });
}
// Your orange cam/selfie verify embed (ONLY that emoji)
function buildWockhardtVerifyEmbed2() {
return new EmbedBuilder()
.setColor(0xffa500)
.setTitle("HOW TO VERIFY")
.setDescription(
[
"You MUST verify to post in the selfies channels.",
"",
"──────────",
"",
"<:omgdghhg:1451163968377978902>  @𖦹・wock𖦹girlz",
"<:omgdghhg:1451163968377978902>  @𖦹・wock𖦹boyz",
"",
"──────────",
"",
"VERIFY OPTIONS",
"",
"• Join a private VC with staff and turn your camera on",
"• OR take a selfie holding paper that says:",
"  WOCKHARDT / your username / today’s date",
"",
"↳ Open a ticket below",
"",
"Tag a staff member in chat after they see you on cam.",
].join("\n")
)
.setTimestamp();
}
/* ---------- COLOR ROLES (LUXURY, NO COLOR BAR, NO FOOTER) ---------- */
function buildColorRolesEmbed() {
const top = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
const mid = "━━━━━━━━━━━━━━✦━━━━━━━━━━━━━━";
return new EmbedBuilder()
// NO .setColor() -> no embed color stripe
.setTitle("🎨 ††・𝐖𝐎𝐂𝐊𝐇𝐀𝐑𝐃𝐓 ・ 𝐂𝐎𝐋𝐎𝐑 𝐑𝐎𝐋𝐄𝐒")
.setDescription(
[
top,
"",
"Pick ONE color below.",
"Choosing another one will swap your color.",
"",
mid,
"",
${COLOR_EMOJIS.red} **RED**      ${COLOR_EMOJIS.orange} **ORANGE**      ${COLOR_EMOJIS.blue} **BLUE**,
${COLOR_EMOJIS.yellow} **YELLOW**   ${COLOR_EMOJIS.green} **GREEN**       ${COLOR_EMOJIS.purple} **PURPLE**,
"",
mid,
"",
"Tap a button below to select.",
"",
top,
].join("\n")
)
.setImage(COLOR_HEADER_IMG)
.setTimestamp();
}
function buildColorRoleButtons() {
const row1 = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("color_red").setLabel("RED").setEmoji("1451264887513682101").setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId("color_orange").setLabel("ORANGE").setEmoji("1451264991188488296").setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId("color_blue").setLabel("BLUE").setEmoji("1451265073866870937").setStyle(ButtonStyle.Secondary)
);
const row2 = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("color_yellow").setLabel("YELLOW").setEmoji("1451265135007240225").setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId("color_green").setLabel("GREEN").setEmoji("1451265183014977537").setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId("color_purple").setLabel("PURPLE").setEmoji("1451265302435205325").setStyle(ButtonStyle.Secondary)
);
const rows = [row1, row2];
if (ENABLE_COLOR_CLEAR) {
rows.push(
new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("color_clear").setLabel("REMOVE COLOR").setStyle(ButtonStyle.Danger)
)
);
}
return rows;
}
/* ---------- BUTTONS ---------- /
/ ✅ UPDATED to NEW server/channel links */
const rowLinks = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setLabel("CREATE VC")
.setStyle(ButtonStyle.Link)
.setURL("https://discord.com/channels/1344613713608708168/1451498864350859264"),
new ButtonBuilder()
.setLabel("MAIN CHAT")
.setStyle(ButtonStyle.Link)
.setURL("https://discord.com/channels/1344613713608708168/1381307499461869659")
);
const rowVerify = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("verify_btn")
.setLabel("☆ Verify Me ☆")
.setEmoji("1376495549179756607")
.setStyle(ButtonStyle.Secondary)
);
/* ---------- POOLS ---------- */
const GIFS = [
"https://i.imgur.com/3X8MPrv.gif",
"https://i.imgur.com/F3hE9aR.gif",
"https://i.imgur.com/uS7NPr0.gif",
];
// Welcome #1 matching gifs
const PURPLE_GIF =
"https://cdn.discordapp.com/attachments/1447035798930325574/1448678742225326221/1B071050-EBBC-499A-9766-0B1B8EA76E04.gif";
const RED_GIF =
"https://cdn.discordapp.com/attachments/1447035798930325574/1448684013458817117/705C1CE2-E35E-4FC5-9DFC-0F9B05CB1F52.gif";
// Welcome #3 / Welcome #2 rotation colors
const WELCOME3_COLORS = [
0xffa500, // orange
0x00ff7f, // green
0xb00000, // red
0x8a2be2, // purple
];
const PICKUPS = [
"Are you a double cup? cos I wanna hold you all night",
"Is your name Wock? cos I’m tryna pour into you",
];
const EIGHT = [
"Pour up",
"Pause pour",
"Double cup says yes",
"Foam cloudy ask later",
"Too much ice try again",
"Sip slow – yes",
"Cut with soda nah",
"Foam clear definitely",
"Sticky cup maybe",
"Codeine vibes only",
];
const COMPLIMENTS = [
"looks fire today",
"has elite cup-holding skills",
"is the main character",
"smells like lavender lean",
];
/* ---------- CACHES ---------- */
client.snipe = new Map();
client.editSnipe = new Map();
client.afk = new Map();
/* ---------- READY ---------- */
client.once("ready", async () => {
console.log(WOCKHARDT online as ${client.user.tag});
console.log(Voice enabled? ${ENABLE_VOICE && !!voice});
const guild = GUILD_ID ? client.guilds.cache.get(GUILD_ID) : null;
if (guild) {
if (ENABLE_VOICE) await joinIdleVC(guild);
// Post verify embed once (safe)
try {
  const vch = guild.channels.cache.get(VERIFY_CH);
  if (vch && vch.isTextBased()) {
    const msgs = await vch.messages.fetch({ limit: 5 });
    const already = msgs.find((m) => m.author.id === client.user.id && m.components?.length);
    if (!already) await vch.send({ embeds: [buildVerifyEmbed()], components: [rowVerify] });
  }
} catch (e) {
  console.warn("verify post error:", e?.message);
}

} else {
console.log("ℹ️ No GUILD_ID set or bot not cached in that guild yet; skipping auto verify post & VC join.");
}
});
/* ---------- MEMBER JOIN (ONLY 2 WELCOMES) ---------- */
client.on("guildMemberAdd", async (m) => {
// welcome #1: role rotation
const roles = [PURPLE_ROLE, RED_ROLE];
const pick = roles[Math.floor(Math.random() * roles.length)];
const gif = pick === PURPLE_ROLE ? PURPLE_GIF : RED_GIF;
await m.roles.add(pick).catch(() => {});
// send welcome #1
const ch1 = m.guild.channels.cache.get(WELCOME_CH);
if (ch1 && ch1.isTextBased()) {
ch1.send({ embeds: [buildWelcomeEmbed(m, pick, gif)], components: [rowLinks] }).catch(() => {});
}
// send welcome #2 (NO GIF) + true mention ping
const ch2 = m.guild.channels.cache.get(WELCOME_CH_2);
if (ch2 && ch2.isTextBased()) {
ch2.send({
content: **Welcome <@${m.id}> 🍇**,
allowedMentions: { users: [m.id] },
embeds: [buildWelcomeEmbed2(m)],
}).catch(() => {});
}
});
/* ---------- SNIPE LISTENERS ---------- */
client.on("messageDelete", (msg) => {
if (!msg?.author || msg.author.bot) return;
client.snipe.set(msg.channel.id, { author: msg.author, content: msg.content, createdAt: msg.createdAt });
});
client.on("messageUpdate", (oldMsg, newMsg) => {
if (!newMsg?.author || newMsg.author.bot) return;
client.editSnipe.set(newMsg.channel.id, {
author: newMsg.author,
old: oldMsg?.content || "",
new: newMsg?.content || "",
createdAt: newMsg.createdAt,
});
});
/* ---------- COMMANDS ---------- */
client.on("messageCreate", async (m) => {
if (m.author.bot) return;
// Ignore typed /commands unless it’s from OWNER (optional)
if (m.content.startsWith("/") && OWNER_ID && m.author.id !== OWNER_ID) return;
if (!m.content.startsWith(PREFIX)) return;
// delete user command message after 5s
autoDelete(m, 5000);
const args = m.content.slice(PREFIX.length).trim().split(/\s+/);
const cmd = (args.shift() || "").toLowerCase();
/* ✅ PUBLIC: -sip (ONLY sip exists now, not duplicated anywhere) */
if (cmd === "sip") {
const role = m.guild.roles.cache.get(PIC_PERM_ROLE) || null;
if (!role) {
  const r = await m.reply("Pic perm role not found. Set PIC_PERM_ROLE correctly.");
  autoDelete(r, 5000);
  return;
}

if (m.member.roles.cache.has(role.id)) {
  const r = await m.reply("You already got pic perms 🥤");
  autoDelete(r, 5000);
  return;
}

await m.member.roles.add(role).catch(() => {});
const r = await m.reply("🥤 Pic perms unlocked.");
autoDelete(r, 5000);
return;

}
/* =====  OWNER-ONLY CLEARMY  ===== */
if (cmd === "clearmy") {
if (m.author.id !== OWNER_ID) return;          // silently ignore non-owners
const amount = Math.min(parseInt(args[0]) || 25, 100);
try {
  const fetched = await m.channel.messages.fetch({ limit: 100 });
  const mine = fetched.filter(msg => msg.author.id === OWNER_ID).first(amount);
  await m.delete().catch(()=>{});              // delete the command call
  if (mine.length) await m.channel.bulkDelete(mine, true);
  const ok = await m.channel.send(`🧹 Deleted **${mine.length}** of my messages.`);
  autoDelete(ok, 5000);
} catch (e) {
  const err = await m.channel.send("❌ Couldn’t bulk-delete.");
  autoDelete(err, 5000);
}
return;                                        // stop processing

}
// staff gate (ALL other commands staff-only)
if (!isStaff(m)) {
const warn = await m.reply("🚫 Staff only.");
autoDelete(warn, 5000);
return;
}
/* ----- TEST WELCOMES (FORCED) ----- */
if (cmd === "testwelcome1") {
return m.channel.send({ embeds: [buildWelcomeEmbed(m.member, RED_ROLE, RED_GIF)], components: [rowLinks] });
}
if (cmd === "testwelcome2") {
return m.channel.send({ embeds: [buildWelcomeEmbed(m.member, PURPLE_ROLE, PURPLE_GIF)], components: [rowLinks] });
}
// ✅ testwelcome3 stays the same (it just posts in the channel you run it in)
if (cmd === "testwelcome3") {
return m.channel.send({ embeds: [buildWelcomeEmbed3(m.member)] });
}
/* ----- POSTS (EMBEDS STAY) ----- */
if (cmd === "verify") {
return m.channel.send({ embeds: [buildVerifyEmbed()], components: [rowVerify] });
}
if (cmd === "verifycam") {
return m.channel.send({ embeds: [buildWockhardtVerifyEmbed2()] });
}
/* ----- COLOR ROLES PANEL (EMBEDS STAY) ----- */
if (cmd === "colors" || cmd === "testcolors") {
return m.channel.send({ embeds: [buildColorRolesEmbed()], components: buildColorRoleButtons() });
}
/* ----- CORE ----- */
if (cmd === "wock") {
const role = m.guild.roles.cache.find((r) => r.name.toLowerCase() === "wock");
if (!role) {
const r = await m.reply("Wock role not found.");
autoDelete(r, 5000);
return;
}
if (m.member.roles.cache.has(role.id)) {
const r = await m.reply("You already got the wock 🥤");
autoDelete(r, 5000);
return;
}
try {
  await m.member.roles.add(role);
  await m.member.setNickname(`⟦𝙬𝙤𝙘𝙠⟧ 🥤 ${m.author.username}`);
  const r = await m.reply(`Wock tag applied 🥤  **${m.member.displayName}**`);
  autoDelete(r, 5000);
  return;
} catch (e) {
  const r = await m.reply(`❌ ${e.message}`);
  autoDelete(r, 5000);
  return;
}

}
/* FUN */
if (cmd === "lean") {
const sent = await m.channel.send({ files: [rand(GIFS)] });
autoDelete(sent, 5000);
return;
}
if (cmd === "gif") {
const r = await m.reply(rand(GIFS));
autoDelete(r, 5000);
return;
}
if (cmd === "8cup") {
const r = await m.reply(🎱 **${rand(EIGHT)}**);
autoDelete(r, 5000);
return;
}
if (cmd === "pickup") {
const r = await m.reply(rand(PICKUPS));
autoDelete(r, 5000);
return;
}
if (cmd === "iq") {
const who = m.mentions.users.first() || m.author;
const r = await m.reply(${who} IQ is **${Math.floor(Math.random() * 200)}**);
autoDelete(r, 5000);
return;
}
if (cmd === "ship") {
const a = m.mentions.users.first();
const b = m.mentions.users.last();
if (!a || !b || a.id === b.id) {
const r = await m.reply("tag two different users");
autoDelete(r, 5000);
return;
}
const score = Math.floor(Math.random() * 101);
const r = await m.reply(💜 **${a.username}** × **${b.username}** ➜ **${score}%**);
autoDelete(r, 5000);
return;
}
if (cmd === "coinflip") {
const r = await m.reply(🪙 **${Math.random() > 0.5 ? "Heads" : "Tails"}**);
autoDelete(r, 5000);
return;
}
if (cmd === "roll") {
const n = Math.max(2, Math.min(parseInt(args[0] || "6", 10), 1000000));
const r = await m.reply(🎲 **${Math.floor(Math.random() * n) + 1}** (1-${n}));
autoDelete(r, 5000);
return;
}
if (cmd === "reverse") {
const r = await m.reply(args.join(" ").split("").reverse().join(""));
autoDelete(r, 5000);
return;
}
if (cmd === "mock") {
const t = args.join(" ");
const r = await m.reply(t.split("").map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join(""));
autoDelete(r, 5000);
return;
}
if (cmd === "emojify") {
const map = {
a: "🇦", b: "🇧", c: "🇨", d: "🇩", e: "🇪", f: "🇫", g: "🇬", h: "🇭", i: "🇮", j: "🇯",
k: "🇰", l: "🇱", m: "🇲", n: "🇳", o: "🇴", p: "🇵", q: "🇶", r: "🇷", s: "🇸", t: "🇹",
u: "🇺", v: "🇻", w: "🇼", x: "🇽", y: "🇾", z: "🇿",
};
const r = await m.reply(args.join(" ").toLowerCase().split("").map((c) => map[c] || c).join(" "));
autoDelete(r, 5000);
return;
}
if (cmd === "drank") {
const msgs = await m.channel.messages.fetch({ limit: 2 });
const last = msgs.last();
if (last) await last.react("🥤").catch(() => {});
return;
}
/* STATS */
if (cmd === "count") {
const w = m.guild.roles.cache.find((r) => r.name.toLowerCase() === "wock");
const r = await m.reply(🥤 **${w ? w.members.size : 0}** sippers right now);
autoDelete(r, 5000);
return;
}
if (cmd === "leaderboard") {
const purp = m.guild.roles.cache.get(PURPLE_ROLE)?.members.map((mm) => mm.user.tag) || [];
const red = m.guild.roles.cache.get(RED_ROLE)?.members.map((mm) => mm.user.tag) || [];
const lines = ["**Leaderboard**"];
purp.forEach((u, i) => lines.push(`${i + 1}. 🟣 ${u}`));
red.forEach((u, i) => lines.push(`${purp.length + i + 1}. 🔴 ${u}`));

const sent = await m.channel.send(lines.join("\n").slice(0, 2000));
autoDelete(sent, 5000);
return;

}
if (cmd === "wockstats") {
const g = m.guild;
const stats = {
purp: g.roles.cache.get(PURPLE_ROLE)?.members.size || 0,
red: g.roles.cache.get(RED_ROLE)?.members.size || 0,
wock: g.roles.cache.find((r) => r.name.toLowerCase() === "wock")?.members.size || 0,
verified: VERIFIED_ROLE_ID ? (g.roles.cache.get(VERIFIED_ROLE_ID)?.members.size || 0) : 0,
};
return m.channel.send({
  embeds: [
    new EmbedBuilder()
      .setColor(0x8b00ff)
      .setTitle("WOCKHARDT STATS")
      .setDescription(
        `🟣 Purp: **${stats.purp}**\n🔴 Red: **${stats.red}**\n🥤 Wock: **${stats.wock}**\n✅ Verified: **${stats.verified}**`
      ),
  ],
});

}
/* SOCIAL */
if (cmd === "compliment") {
const who = m.mentions.users.first() || m.author;
const r = await m.reply(${who} ${rand(COMPLIMENTS)});
autoDelete(r, 5000);
return;
}
if (cmd === "insult") {
const who = m.mentions.users.first() || m.author;
const data = await fetch("https://evilinsult.com/generate_insult.php?lang=en&type=json")
.then((r) => r.json())
.catch(() => null);
const r = await m.reply(${who} ${data?.insult || "you got a weak pour."});
autoDelete(r, 5000);
return;
}
if (cmd === "dadjoke") {
const d = await fetch("https://icanhazdadjoke.com/", { headers: { Accept: "application/json" } })
.then((r) => r.json())
.catch(() => null);
const r = await m.reply(d?.joke || "I had a joke… but I spilled it in the cup 😭");
autoDelete(r, 5000);
return;
}
if (cmd === "quote") {
const q = await fetch("https://type.fit/api/quotes").then((r) => r.json()).catch(() => []);
const pick = q?.length ? rand(q) : { text: "Stay solid.", author: "WOCK" };
const r = await m.reply(“${pick.text}” — ${pick.author || "Unknown"});
autoDelete(r, 5000);
return;
}
if (cmd === "fact") {
const f = await fetch("https://uselessfacts.jsph.pl/random.json?language=en").then((r) => r.json()).catch(() => null);
const r = await m.reply(f?.text || "Fun fact: you still a legend.");
autoDelete(r, 5000);
return;
}
/* API FUN (KEYLESS) */
if (cmd === "joke") {
const j = await fetch("https://official-joke-api.appspot.com/random_joke").then((r) => r.json()).catch(() => null);
if (!j) {
const r = await m.reply("no jokes rn");
autoDelete(r, 5000);
return;
}
return m.reply({ embeds: [new EmbedBuilder().setColor(0x8b00ff).setTitle(j.setup).setDescription(j.punchline)] });
}
if (cmd === "meme") {
const meme = await fetch("https://meme-api.com/gimme").then((r) => r.json()).catch(() => null);
if (!meme?.url) {
const r = await m.reply("no meme rn");
autoDelete(r, 5000);
return;
}
return m.reply({ embeds: [new EmbedBuilder().setTitle(meme.title || "meme").setImage(meme.url).setColor(0x8b00ff)] });
}
if (cmd === "cat") {
const url = (await fetch("https://api.thecatapi.com/v1/images/search").then((r) => r.json()).catch(() => []))?.[0]?.url;
const sent = url ? await m.reply({ files: [url] }) : await m.reply("no cat rn");
autoDelete(sent, 5000);
return;
}
if (cmd === "dog") {
const url = (await fetch("https://api.thedogapi.com/v1/images/search").then((r) => r.json()).catch(() => []))?.[0]?.url;
const sent = url ? await m.reply({ files: [url] }) : await m.reply("no dog rn");
autoDelete(sent, 5000);
return;
}
/* TOOLS (KEYLESS) */
if (cmd === "translate") {
const [fromTo, ...text] = args;
if (!fromTo || !text.length) {
const r = await m.reply(use: ${PREFIX}translate es|en hola);
autoDelete(r, 5000);
return;
}
const [from, to] = fromTo.split("|");
if (!from || !to) {
const r = await m.reply(use: ${PREFIX}translate es|en hola);
autoDelete(r, 5000);
return;
}
const url = https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.join(" "))}&langpair=${from}|${to};
const data = await fetch(url).then((r) => r.json()).catch(() => null);
const r = await m.reply(data?.responseData?.translatedText || "couldn’t translate that rn");
autoDelete(r, 5000);
return;
}
if (cmd === "weather") {
const city = args.join(" ");
if (!city) {
const r = await m.reply(use: ${PREFIX}weather austin);
autoDelete(r, 5000);
return;
}
const url = https://wttr.in/${encodeURIComponent(city)}?format=j1;
const data = await fetch(url).then((r) => r.json()).catch(() => null);
if (!data?.current_condition?.[0]) {
const r = await m.reply("city not found");
autoDelete(r, 5000);
return;
}
const c = data.current_condition[0];
return m.reply({
embeds: [
new EmbedBuilder()
.setColor(0x8b00ff)
.setTitle(Weather – ${city})
.addFields(
{ name: "Temp", value: ${c.temp_C}°C / ${c.temp_F}°F, inline: true },
{ name: "Feels", value: ${c.FeelsLike_C}°C / ${c.FeelsLike_F}°F, inline: true },
{ name: "Condition", value: ${c.weatherDesc?.[0]?.value || "—"}, inline: true }
),
],
});
}
if (cmd === "minecraft") {
const ip = args[0];
if (!ip) {
const r = await m.reply(use: ${PREFIX}minecraft play.hypixel.net);
autoDelete(r, 5000);
return;
}
const data = await fetch(https://api.mcsrvstat.us/2/${encodeURIComponent(ip)}).then((r) => r.json()).catch(() => null);
if (!data?.online) {
const r = await m.reply("server offline / not found");
autoDelete(r, 5000);
return;
}
return m.reply({
embeds: [
new EmbedBuilder()
.setColor(0x8b00ff)
.setTitle(ip)
.addFields(
{ name: "Players", value: ${data.players?.online ?? 0}/${data.players?.max ?? "?"}, inline: true },
{ name: "Version", value: ${data.version || "?"}, inline: true }
),
],
});
}
if (cmd === "qr") {
const txt = args.join(" ");
if (!txt) {
const r = await m.reply(use: ${PREFIX}qr wockhardt);
autoDelete(r, 5000);
return;
}
const url = https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(txt)};
const sent = await m.reply({ files: [url] });
autoDelete(sent, 5000);
return;
}
if (cmd === "shorten") {
const url = args[0];
if (!url) {
const r = await m.reply(use: ${PREFIX}shorten https://...);
autoDelete(r, 5000);
return;
}
const data = await fetch(https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(url)}).then((r) => r.json()).catch(() => null);
if (!data?.ok) {
const r = await m.reply("couldn’t shorten that");
autoDelete(r, 5000);
return;
}
const r = await m.reply(data.result.full_short_link);
autoDelete(r, 5000);
return;
}
if (cmd === "calc") {
const expr = args.join(" ");
if (!expr) {
const r = await m.reply(use: ${PREFIX}calc (2+2)*5);
autoDelete(r, 5000);
return;
}
try {
const safe = expr.replace(/[^0-9+-*/().\s]/g, "");
const ans = Function("use strict"; return (${safe});)();
const r = await m.reply(🧮 ${expr} = **${ans}**);
autoDelete(r, 5000);
return;
} catch {
const r = await m.reply("invalid math");
autoDelete(r, 5000);
return;
}
}
if (cmd === "binary") {
const txt = args.join(" ");
if (!txt) {
const r = await m.reply(use: ${PREFIX}binary hello);
autoDelete(r, 5000);
return;
}
const r = await m.reply(txt.split("").map((c) => c.charCodeAt(0).toString(2)).join(" "));
autoDelete(r, 5000);
return;
}
if (cmd === "password") {
const len = Math.max(6, Math.min(parseInt(args[0] || "16", 10), 64));
const pass = [...Array(len)].map(() => Math.random().toString(36).slice(-1)).join("");
await m.author.send(🔑 **${pass}**).catch(() => {});
const r = await m.reply("DM sent");
autoDelete(r, 5000);
return;
}
/* INFO */
if (cmd === "serverinfo") {
const g = m.guild;
return m.reply({
embeds: [
new EmbedBuilder()
.setColor(0x8b00ff)
.setTitle(g.name)
.addFields(
{ name: "Members", value: ${g.memberCount}, inline: true },
{ name: "Roles", value: ${g.roles.cache.size}, inline: true },
{ name: "Boost", value: Tier ${g.premiumTier}, inline: true },
{ name: "Created", value: g.createdAt.toDateString(), inline: true }
)
.setThumbnail(g.iconURL({ dynamic: true })),
],
});
}
if (cmd === "userinfo") {
const u = m.mentions.users.first() || m.author;
const mm = await m.guild.members.fetch(u.id).catch(() => null);
if (!mm) {
  const r = await m.reply("user not found");
  autoDelete(r, 5000);
  return;
}

return m.reply({
  embeds: [
    new EmbedBuilder()
      .setColor(0x8b00ff)
      .setTitle(u.tag)
      .addFields(
        { name: "Joined", value: mm.joinedAt ? mm.joinedAt.toDateString() : "—", inline: true },
        { name: "Created", value: u.createdAt ? u.createdAt.toDateString() : "—", inline: true }
      )
      .setThumbnail(u.displayAvatarURL({ dynamic: true })),
  ],
});

}
if (cmd === "avatar") {
const u = m.mentions.users.first() || m.author;
const sent = await m.reply({ files: [u.displayAvatarURL({ size: 4096, dynamic: true })] });
autoDelete(sent, 5000);
return;
}
if (cmd === "emoji") {
const emo = m.content.split(" ").slice(1).find((e) => e.startsWith("<"));
if (!emo) {
const r = await m.reply("send an emoji like <:name:id>");
autoDelete(r, 5000);
return;
}
const match = emo.match(/<(a)?:(\w+):(\d+)>/);
if (!match) {
const r = await m.reply("invalid emoji");
autoDelete(r, 5000);
return;
}
const url = https://cdn.discordapp.com/emojis/${match[3]}${match[1] ? ".gif" : ".png"}?size=4096;
const sent = await m.reply({ files: [url] });
autoDelete(sent, 5000);
return;
}
if (cmd === "servericon") {
const icon = m.guild.iconURL({ size: 4096, dynamic: true });
const sent = icon ? await m.reply({ files: [icon] }) : await m.reply("no icon");
autoDelete(sent, 5000);
return;
}
if (cmd === "channelinfo") {
const c = m.channel;
return m.reply({
embeds: [
new EmbedBuilder()
.setColor(0x8b00ff)
.setTitle(#${c.name})
.addFields(
{ name: "ID", value: c.id, inline: true },
{ name: "Type", value: ${c.type}, inline: true },
{ name: "Created", value: c.createdAt.toDateString(), inline: true }
),
],
});
}
/* MOD */
if (cmd === "clear") {
if (!m.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return m.react("❌");
const n = Math.min(parseInt(args[0] || "1", 10), 100);
await m.channel.bulkDelete(n + 1, true).catch(() => {});
const msg = await m.channel.send(🧹 ${n} gone);
autoDelete(msg, 5000);
return;
}
if (cmd === "say") {
if (!m.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return m.react("❌");
const txt = args.join(" ");
if (!txt) return;
const sent = await m.channel.send(txt);
autoDelete(sent, 5000);
return;
}
if (cmd === "embed") {
if (!m.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return m.react("❌");
const raw = args.join(" ");
const [title, ...desc] = raw.split("|");
return m.channel.send({
embeds: [
new EmbedBuilder()
.setColor(0x8b00ff)
.setTitle(title?.trim() || "WOCK")
.setDescription(desc.join("|").trim() || " "),
],
});
}
if (cmd === "mute") {
if (!m.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return m.react("❌");
const target = m.mentions.members.first();
if (!target) {
const r = await m.reply("tag someone");
autoDelete(r, 5000);
return;
}
const time = ms(args[0] || "1m");
await target.timeout(time).catch(() => {});
const r = await m.reply(${target.user.tag} muted for ${ms(time, { long: true })});
autoDelete(r, 5000);
return;
}
if (cmd === "unmute") {
if (!m.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return m.react("❌");
const target = m.mentions.members.first();
if (!target) {
const r = await m.reply("tag someone");
autoDelete(r, 5000);
return;
}
await target.timeout(null).catch(() => {});
const r = await m.reply(${target.user.tag} unmuted);
autoDelete(r, 5000);
return;
}
if (cmd === "slowmode") {
if (!m.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return m.react("❌");
const sec = Math.min(parseInt(args[0] || "0", 10), 21600);
await m.channel.setRateLimitPerUser(sec).catch(() => {});
const r = await m.reply(Slow-mode set to **${sec}s**);
autoDelete(r, 5000);
return;
}
if (cmd === "lock") {
if (!m.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return m.react("❌");
await m.channel.permissionOverwrites.edit(m.guild.id, { SendMessages: false }).catch(() => {});
const r = await m.reply("🔒 Channel locked");
autoDelete(r, 5000);
return;
}
if (cmd === "unlock") {
if (!m.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return m.react("❌");
await m.channel.permissionOverwrites.edit(m.guild.id, { SendMessages: true }).catch(() => {});
const r = await m.reply("🔓 Channel unlocked");
autoDelete(r, 5000);
return;
}
/* AFK + SNIPES */
if (cmd === "afk") {
const reason = args.join(" ") || "AFK";
client.afk.set(m.author.id, reason);
const r = await m.reply(I set you AFK: ${reason});
autoDelete(r, 5000);
return;
}
if (cmd === "snipe") {
const msg = client.snipe.get(m.channel.id);
if (!msg) {
const r = await m.reply("nothing to snipe");
autoDelete(r, 5000);
return;
}
return m.channel.send({
embeds: [
new EmbedBuilder()
.setColor(0x8b00ff)
.setAuthor({ name: msg.author.tag, iconURL: msg.author.displayAvatarURL() })
.setDescription(msg.content || " ")
.setTimestamp(msg.createdAt),
],
});
}
if (cmd === "editsnipe") {
const msg = client.editSnipe.get(m.channel.id);
if (!msg) {
const r = await m.reply("nothing to editsnipe");
autoDelete(r, 5000);
return;
}
return m.channel.send({
embeds: [
new EmbedBuilder()
.setColor(0x8b00ff)
.setAuthor({ name: msg.author.tag, iconURL: msg.author.displayAvatarURL() })
.addFields(
{ name: "Before", value: msg.old?.slice(0, 1024) || " " },
{ name: "After", value: msg.new?.slice(0, 1024) || " " }
)
.setTimestamp(msg.createdAt),
],
});
}
/* HELP (EMBED STAYS) */
if (cmd === "help") {
return m.reply({
embeds: [
new EmbedBuilder()
.setColor(0x8b00ff)
.setTitle("WOCKHARDT COMMANDS")
.setDescription(
[
**Public:** -sip,
``,
**Welcome Tests (Staff):** -testwelcome1 (RED) -testwelcome2 (PURPLE) -testwelcome3,
`Posts (Staff): -verify -verifycam`,
`Color Roles (Staff posts panel): -colors (-testcolors)`,
`Core (Staff): -wock -count -leaderboard -wockstats`,
`Fun (Staff): -lean -gif -8cup -pickup -iq -ship -coinflip -roll -reverse -mock -emojify -drank`,
`Social (Staff): -compliment -insult -dadjoke -quote -fact`,
`Tools (Staff): -weather -translate -minecraft -qr -shorten -calc -binary -password`,
`Info (Staff): -serverinfo -userinfo -avatar -emoji -servericon -channelinfo`,
`Mod (Staff): -clear -say -embed -mute -unmute -slowmode -lock -unlock`,
`Snipes (Staff): -afk -snipe -editsnipe`,
`Note: Verify + color buttons are public • Embeds never delete`,
].join("\n")
),
],
});
}
// Unknown command
const r = await m.reply("unknown command");
autoDelete(r, 5000);
});
/* ---------- BUTTONS (PUBLIC): VERIFY + COLOR ROLES ---------- */
client.on("interactionCreate", async (i) => {
if (!i.isButton()) return;
/* ----- VERIFY BUTTON ----- */
if (i.customId === "verify_btn") {
const role = VERIFIED_ROLE_ID ? i.guild.roles.cache.get(VERIFIED_ROLE_ID) : null;
if (!role) return i.reply({ content: "⚠️ Verified role not found.", ephemeral: true });
if (i.member.roles.cache.has(role.id)) return i.reply({ content: "You're already verified.", ephemeral: true });

await i.member.roles.add(role).catch(() => {});
return i.reply({ content: "✅ Verified—welcome to WOCKHARDT!", ephemeral: true });

}
/* ----- COLOR ROLE BUTTONS ----- */
if (!i.customId.startsWith("color_")) return;
const key = i.customId.split("_")[1]; // red/orange/blue/yellow/green/purple/clear
const allRoleIds = Object.values(COLOR_ROLES).filter(Boolean);
// Clear
if (key === "clear") {
if (allRoleIds.length) await i.member.roles.remove(allRoleIds).catch(() => {});
return i.reply({ content: "🧼 Color removed.", ephemeral: true });
}
const roleIdToAdd = COLOR_ROLES[key];
if (!roleIdToAdd) {
return i.reply({
content: "⚠️ Color roles not set. Add Railway env vars: COLOR_ROLE_RED/ORANGE/BLUE/YELLOW/GREEN/PURPLE",
ephemeral: true,
});
}
const alreadyHas = i.member.roles.cache.has(roleIdToAdd);
// Remove all colors first
if (allRoleIds.length) await i.member.roles.remove(allRoleIds).catch(() => {});
// Toggle off if clicked same color
if (alreadyHas) return i.reply({ content: "🧼 Color removed.", ephemeral: true });
// Add selected
await i.member.roles.add(roleIdToAdd).catch(() => {});
return i.reply({ content: 🎨 Color set: **${key.toUpperCase()}**, ephemeral: true });
});
/* ---------- LOGIN ---------- */
client.login(TOKEN);
