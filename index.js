/*  WOCKHARDT-BOT v2 – Bleed-style, KEYLESS + Railway-safe
    - Prefix: -
    - Commands: STAFF ONLY (owner/admin/mod)
    - Buttons: PUBLIC (verify button)
    - Auto delete after 5s:
        • user command message
        • bot NON-EMBED messages
      Embeds NEVER delete
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
const WELCOME_CH = process.env.WELCOME_CH || "1446420100822335633";
const WELCOME_CH_2 = process.env.WELCOME_CH_2 || "1447035798930325574";
const VERIFY_CH = process.env.VERIFY_CH || "1449275035020689458";

const IDLE_VC_ID = process.env.IDLE_VC_ID || "1447154877150265466";
const PURPLE_ROLE = process.env.PURPLE_ROLE || "1448654794259435614";
const RED_ROLE = process.env.RED_ROLE || "1448654699187277875";
const PIC_PERM_ROLE = process.env.PIC_PERM_ROLE || ""; // set in Railway for now

const GUILD_ID = process.env.GUILD_ID; // recommended
const TOKEN = process.env.TOKEN;

// Staff lock
const OWNER_ID = process.env.OWNER_ID || "";
const MOD_ROLE_IDS = (process.env.MOD_ROLE_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (!TOKEN) throw new Error("Missing TOKEN (set it in Railway Variables or .env)");

/* ---------- OPTIONAL VOICE ---------- */
const ENABLE_VOICE = String(process.env.ENABLE_VOICE || "false").toLowerCase() === "true";

let voice = null;
if (ENABLE_VOICE) {
  try {
    voice = require("@discordjs/voice");
  } catch {
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
    GatewayIntentBits.GuildInvites,
  ],
  partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User],
});

/* ---------- UTILS ---------- */
const PREFIX = "-";
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

function autoDelete(msg, delay = 5000) {
  if (!msg) return;
  // ✅ never delete embeds
  if (msg.embeds && msg.embeds.length > 0) return;
  setTimeout(() => msg.delete().catch(() => {}), delay);
}

function isStaff(m) {
  if (!m?.guild || !m?.member) return false;

  if (OWNER_ID && m.author.id === OWNER_ID) return true;

  if (m.member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;

  if (
    m.member.permissions.has(PermissionsBitField.Flags.ManageMessages) ||
    m.member.permissions.has(PermissionsBitField.Flags.ModerateMembers) ||
    m.member.permissions.has(PermissionsBitField.Flags.ManageGuild)
  )
    return true;

  if (MOD_ROLE_IDS.length && MOD_ROLE_IDS.some((id) => m.member.roles.cache.has(id))) return true;

  return false;
}

/* ---------- OPTIONAL VC JOIN (NO AUDIO) ---------- */
async function joinIdleVC(guild) {
  if (!voice) return;
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
      `𝘞𝘦𝘭𝘤𝘰𝘮𝘦 𝘵𝘰 𝘵𝘩𝘦 𝘞𝘰𝘤𝘬 𝘡𝘰𝘯𝘦, ${member}\n\n✦ 𝘴𝘵𝘢𝘺 𝘢𝘤𝘵𝘪𝘷𝘦\n✦ 𝘪𝘯𝘷 𝟯 𝘧𝘰𝘳 𝘱𝘦𝘳𝘮𝘴\n✦ 𝘧𝘦𝘦𝘭 𝘢𝘵 𝘩𝘰𝘮𝘦`
    )
    .setImage(gif)
    .setColor(color)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setTimestamp();
}

const WELCOME2_GIFS = [
  "https://media.discordapp.net/attachments/1447035798930325574/1448678742225326221/1B071050-EBBC-499A-9766-0B1B8EA76E04.gif",
  "https://media.discordapp.net/attachments/1447035798930325574/1448684013458817117/705C1CE2-E35E-4FC5-9DFC-0F9B05CB1F52.gif",
];

function buildWelcomeEmbed2(member) {
  const gif = rand(WELCOME2_GIFS);
  const unix = Math.floor(Date.now() / 1000);

  return new EmbedBuilder()
    .setColor(0x8b00ff)
    .setDescription(
      `welc to /𐌕𐌕・𝐖𝐎𝐂𝐊𝐇𝐀𝐑𝐃𝐓 <:lean1:1451089899011964960>\n\n` +
        `**${member.guild.memberCount} members** @ <t:${unix}:f>`
    )
    .setAuthor({
      name: member.user.username,
      iconURL: member.user.displayAvatarURL({ dynamic: true, size: 256 }),
    })
    .setThumbnail(member.guild.iconURL({ dynamic: true, size: 256 }))
    .setImage(gif)
    .setTimestamp();
}

function buildVerifyEmbed() {
  return new EmbedBuilder()
    .setColor(0x8b00ff)
    .setTitle("⛧ 𐌕𐌕・𝐖𝐎𝐂𝐊𝐇𝐀𝐑𝐃𝐓 ・ Verification ⛧")
    .setDescription("Welcome, sipper.\nTap the lean cup below to verify & unlock the rest of the server.")
    .setImage("https://cdn.discordapp.com/attachments/1447035798930325574/1449276801405816995/IMG_4631.png")
    .setFooter({ text: "Verification required • WOCKHARDT" });
}

function buildWockhardtVerifyEmbed2() {
  return new EmbedBuilder()
    .setColor(0xFFA500) // orange
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
        "Tag a staff member in chat after they see you on cam."
      ].join("\n")
    )
    .setTimestamp();
}

/* ---------- BUTTONS ---------- */
const rowLinks = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setLabel("CREATE VC").setStyle(ButtonStyle.Link).setURL("https://discord.gg/AV58C6AwT"),
  new ButtonBuilder()
    .setLabel("MAIN CHAT")
    .setStyle(ButtonStyle.Link)
    .setURL("https://discord.com/channels/1446420100151382131/1446428371595821167")
);

const rowVerify = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("verify_btn")
    .setLabel("☆ Verify Me ☆")
    .setEmoji("<:lean:1435440632431906957>")
    .setStyle(ButtonStyle.Secondary)
);

/* ---------- POOLS ---------- */
const GIFS = [
  "https://i.imgur.com/3X8MPrv.gif",
  "https://i.imgur.com/F3hE9aR.gif",
  "https://i.imgur.com/uS7NPr0.gif",
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
  console.log(`WOCKHARDT online as ${client.user.tag}`);
  console.log(`Voice enabled? ${ENABLE_VOICE && !!voice}`);

  const guild = GUILD_ID ? client.guilds.cache.get(GUILD_ID) : null;

  if (guild) {
    if (ENABLE_VOICE) await joinIdleVC(guild);

    // Post verify embed once (embed stays)
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

/* ---------- MEMBER JOIN (2 WELCOMES) ---------- */
client.on("guildMemberAdd", async (m) => {
  const roles = [PURPLE_ROLE, RED_ROLE];
  const pick = roles[Math.floor(Math.random() * roles.length)];

  const gif =
    pick === PURPLE_ROLE
      ? "https://cdn.discordapp.com/attachments/1447035798930325574/1448678742225326221/1B071050-EBBC-499A-9766-0B1B8EA76E04.gif"
      : "https://cdn.discordapp.com/attachments/1447035798930325574/1448684013458817117/705C1CE2-E35E-4FC5-9DFC-0F9B05CB1F52.gif";

  await m.roles.add(pick).catch(() => {});

  const ch1 = m.guild.channels.cache.get(WELCOME_CH);
  if (ch1 && ch1.isTextBased()) ch1.send({ embeds: [buildWelcomeEmbed(m, pick, gif)], components: [rowLinks] }).catch(() => {});

  const ch2 = m.guild.channels.cache.get(WELCOME_CH_2);
  if (ch2 && ch2.isTextBased()) ch2.send({ embeds: [buildWelcomeEmbed2(m)] }).catch(() => {});
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

/* ---------- COMMANDS (STAFF ONLY) ---------- */
client.on("messageCreate", async (m) => {
  if (m.author.bot) return;
  if (!m.content.startsWith(PREFIX)) return;

  // ✅ Always delete the user's command message after 5s
  autoDelete(m, 5000);

  const args = m.content.slice(PREFIX.length).trim().split(/\s+/);
  const cmd = (args.shift() || "").toLowerCase();

  // 🔒 Staff-only gate (bot reply deletes)
  if (!isStaff(m)) {
    const warn = await m.reply("🚫 Staff only.");
    autoDelete(warn, 5000);
    return;
  }

  /* -------- TEST COMMANDS -------- */
  if (cmd === "testwelcome1") {
    const gif = rand(WELCOME2_GIFS);
    await m.channel.send({ embeds: [buildWelcomeEmbed(m.member, PURPLE_ROLE, gif)], components: [rowLinks] });
    return;
  }
  if (cmd === "testwelcome2") {
    await m.channel.send({ embeds: [buildWelcomeEmbed2(m.member)] });
    return;
  }

  /* -------- POSTS (EMBEDS STAY) -------- */
  if (cmd === "verify") {
    await m.channel.send({ embeds: [buildVerifyEmbed()], components: [rowVerify] });
    return;
  }
  if (cmd === "verifycam") {
    await m.channel.send({ embeds: [buildWockhardtVerifyEmbed2()] });
    return;
  }

  /* -------- CORE -------- */
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

  // ✅ -sip gives pic perms role (reply deletes)
  if (cmd === "sip") {
    if (!PIC_PERM_ROLE) {
      const r = await m.reply("PIC_PERM_ROLE not set in env.");
      autoDelete(r, 5000);
      return;
    }
    const role = m.guild.roles.cache.get(PIC_PERM_ROLE);
    if (!role) {
      const r = await m.reply("Pic perm role not found.");
      autoDelete(r, 5000);
      return;
    }
    if (m.member.roles.cache.has(role.id)) {
      const r = await m.reply("You already got pic perms 🥤");
      autoDelete(r, 5000);
      return;
    }

    await m.member.roles.add(role).catch(() => {});
    const r = await m.reply("🥤 Pic perms unlocked. Sip responsibly.");
    autoDelete(r, 5000);
    return;
  }

  /* -------- FUN -------- */
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
    const r = await m.reply(`🎱 **${rand(EIGHT)}**`);
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
    const r = await m.reply(`${who} IQ is **${Math.floor(Math.random() * 200)}**`);
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
    const r = await m.reply(`💜 **${a.username}** × **${b.username}** ➜ **${score}%**`);
    autoDelete(r, 5000);
    return;
  }
  if (cmd === "coinflip") {
    const r = await m.reply(`🪙 **${Math.random() > 0.5 ? "Heads" : "Tails"}**`);
    autoDelete(r, 5000);
    return;
  }
  if (cmd === "roll") {
    const n = Math.max(2, Math.min(parseInt(args[0] || "6", 10), 1000000));
    const r = await m.reply(`🎲 **${Math.floor(Math.random() * n) + 1}** (1-${n})`);
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

  /* -------- STATS -------- */
  if (cmd === "count") {
    const w = m.guild.roles.cache.find((r) => r.name.toLowerCase() === "wock");
    const r = await m.reply(`🥤 **${w ? w.members.size : 0}** sippers right now`);
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
      verified: g.roles.cache.find((r) => r.name.toLowerCase() === "verified")?.members.size || 0,
    };

    await m.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x8b00ff)
          .setTitle("WOCKHARDT STATS")
          .setDescription(
            `🟣 Purp: **${stats.purp}**\n🔴 Red: **${stats.red}**\n🥤 Wock: **${stats.wock}**\n✅ Verified: **${stats.verified}**`
          ),
      ],
    });
    return;
  }

  /* -------- SOCIAL -------- */
  if (cmd === "compliment") {
    const who = m.mentions.users.first() || m.author;
    const r = await m.reply(`${who} ${rand(COMPLIMENTS)}`);
    autoDelete(r, 5000);
    return;
  }

  if (cmd === "insult") {
    const who = m.mentions.users.first() || m.author;
    const data = await fetch("https://evilinsult.com/generate_insult.php?lang=en&type=json")
      .then((r) => r.json())
      .catch(() => null);
    const r = await m.reply(`${who} ${data?.insult || "you got a weak pour."}`);
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
    const r = await m.reply(`“${pick.text}” — ${pick.author || "Unknown"}`);
    autoDelete(r, 5000);
    return;
  }

  if (cmd === "fact") {
    const f = await fetch("https://uselessfacts.jsph.pl/random.json?language=en").then((r) => r.json()).catch(() => null);
    const r = await m.reply(f?.text || "Fun fact: you still a legend.");
    autoDelete(r, 5000);
    return;
  }

  /* -------- API FUN -------- */
  if (cmd === "joke") {
    const j = await fetch("https://official-joke-api.appspot.com/random_joke").then((r) => r.json()).catch(() => null);
    if (!j) {
      const r = await m.reply("no jokes rn");
      autoDelete(r, 5000);
      return;
    }
    await m.reply({ embeds: [new EmbedBuilder().setColor(0x8b00ff).setTitle(j.setup).setDescription(j.punchline)] });
    return;
  }

  if (cmd === "meme") {
    const meme = await fetch("https://meme-api.com/gimme").then((r) => r.json()).catch(() => null);
    if (!meme?.url) {
      const r = await m.reply("no meme rn");
      autoDelete(r, 5000);
      return;
    }
    await m.reply({ embeds: [new EmbedBuilder().setTitle(meme.title || "meme").setImage(meme.url).setColor(0x8b00ff)] });
    return;
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

  /* -------- TOOLS -------- */
  if (cmd === "translate") {
    const [fromTo, ...text] = args;
    if (!fromTo || !text.length) {
      const r = await m.reply(`use: ${PREFIX}translate es|en hola`);
      autoDelete(r, 5000);
      return;
    }
    const [from, to] = fromTo.split("|");
    if (!from || !to) {
      const r = await m.reply(`use: ${PREFIX}translate es|en hola`);
      autoDelete(r, 5000);
      return;
    }
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.join(" "))}&langpair=${from}|${to}`;
    const data = await fetch(url).then((r) => r.json()).catch(() => null);
    const r = await m.reply(data?.responseData?.translatedText || "couldn’t translate that rn");
    autoDelete(r, 5000);
    return;
  }

  if (cmd === "weather") {
    const city = args.join(" ");
    if (!city) {
      const r = await m.reply(`use: ${PREFIX}weather austin`);
      autoDelete(r, 5000);
      return;
    }
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
    const data = await fetch(url).then((r) => r.json()).catch(() => null);
    if (!data?.current_condition?.[0]) {
      const r = await m.reply("city not found");
      autoDelete(r, 5000);
      return;
    }
    const c = data.current_condition[0];
    await m.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x8b00ff)
          .setTitle(`Weather – ${city}`)
          .addFields(
            { name: "Temp", value: `${c.temp_C}°C / ${c.temp_F}°F`, inline: true },
            { name: "Feels", value: `${c.FeelsLike_C}°C / ${c.FeelsLike_F}°F`, inline: true },
            { name: "Condition", value: `${c.weatherDesc?.[0]?.value || "—"}`, inline: true }
          ),
      ],
    });
    return;
  }

  if (cmd === "minecraft") {
    const ip = args[0];
    if (!ip) {
      const r = await m.reply(`use: ${PREFIX}minecraft play.hypixel.net`);
      autoDelete(r, 5000);
      return;
    }
    const data = await fetch(`https://api.mcsrvstat.us/2/${encodeURIComponent(ip)}`).then((r) => r.json()).catch(() => null);
    if (!data?.online) {
      const r = await m.reply("server offline / not found");
      autoDelete(r, 5000);
      return;
    }
    await m.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x8b00ff)
          .setTitle(ip)
          .addFields(
            { name: "Players", value: `${data.players?.online ?? 0}/${data.players?.max ?? "?"}`, inline: true },
            { name: "Version", value: `${data.version || "?"}`, inline: true }
          ),
      ],
    });
    return;
  }

  if (cmd === "qr") {
    const txt = args.join(" ");
    if (!txt) {
      const r = await m.reply(`use: ${PREFIX}qr wockhardt`);
      autoDelete(r, 5000);
      return;
    }
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(txt)}`;
    const sent = await m.reply({ files: [url] });
    autoDelete(sent, 5000);
    return;
  }

  if (cmd === "shorten") {
    const url = args[0];
    if (!url) {
      const r = await m.reply(`use: ${PREFIX}shorten https://...`);
      autoDelete(r, 5000);
      return;
    }
    const data = await fetch(`https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(url)}`).then((r) => r.json()).catch(() => null);
    const r = await m.reply(data?.ok ? data.result.full_short_link : "couldn’t shorten that");
    autoDelete(r, 5000);
    return;
  }

  if (cmd === "calc") {
    const expr = args.join(" ");
    if (!expr) {
      const r = await m.reply(`use: ${PREFIX}calc (2+2)*5`);
      autoDelete(r, 5000);
      return;
    }
    try {
      const safe = expr.replace(/[^0-9+\-*/().\s]/g, "");
      const ans = Function(`"use strict"; return (${safe});`)();
      const r = await m.reply(`🧮 ${expr} = **${ans}**`);
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
    const r = await m.reply(txt ? txt.split("").map((c) => c.charCodeAt(0).toString(2)).join(" ") : `use: ${PREFIX}binary hello`);
    autoDelete(r, 5000);
    return;
  }

  if (cmd === "password") {
    const len = Math.max(6, Math.min(parseInt(args[0] || "16", 10), 64));
    const pass = [...Array(len)].map(() => Math.random().toString(36).slice(-1)).join("");
    await m.author.send(`🔑 **${pass}**`).catch(() => {});
    const r = await m.reply("DM sent");
    autoDelete(r, 5000);
    return;
  }

  /* -------- INFO -------- */
  if (cmd === "serverinfo") {
    const g = m.guild;
    await m.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x8b00ff)
          .setTitle(g.name)
          .addFields(
            { name: "Members", value: `${g.memberCount}`, inline: true },
            { name: "Roles", value: `${g.roles.cache.size}`, inline: true },
            { name: "Boost", value: `Tier ${g.premiumTier}`, inline: true },
            { name: "Created", value: g.createdAt.toDateString(), inline: true }
          )
          .setThumbnail(g.iconURL({ dynamic: true })),
      ],
    });
    return;
  }

  if (cmd === "userinfo") {
    const u = m.mentions.users.first() || m.author;
    const mm = await m.guild.members.fetch(u.id).catch(() => null);
    if (!mm) {
      const r = await m.reply("user not found");
      autoDelete(r, 5000);
      return;
    }
    await m.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x8b00ff)
          .setTitle(u.tag)
          .addFields(
            { name: "Joined", value: mm.joinedAt ? mm.joinedAt.toDateString() : "—", inline: true },
            { name: "Created", value: u.createdAt.toDateString(), inline: true }
          )
          .setThumbnail(u.displayAvatarURL({ dynamic: true })),
      ],
    });
    return;
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
    const url = `https://cdn.discordapp.com/emojis/${match[3]}${match[1] ? ".gif" : ".png"}?size=4096`;
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
    await m.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x8b00ff)
          .setTitle(`#${c.name}`)
          .addFields(
            { name: "ID", value: c.id, inline: true },
            { name: "Type", value: `${c.type}`, inline: true },
            { name: "Created", value: c.createdAt.toDateString(), inline: true }
          ),
      ],
    });
    return;
  }

  /* -------- MOD -------- */
  if (cmd === "clear") {
    if (!m.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return m.react("❌");
    const n = Math.min(parseInt(args[0] || "1", 10), 100);
    await m.channel.bulkDelete(n + 1, true).catch(() => {});
    const msg = await m.channel.send(`🧹 ${n} gone`);
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
    await m.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x8b00ff)
          .setTitle(title?.trim() || "WOCK")
          .setDescription(desc.join("|").trim() || " "),
      ],
    });
    return;
  }

  if (cmd === "mute") {
    if (!m.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return m.react("❌");
    const target = m.mentions.members.first();
    if (!target) {
      const r = await m.reply("tag someone");
      autoDelete(r, 5000);
      return;
    }
    const time = ms(args[1] || "1m");
    await target.timeout(time).catch(() => {});
    const r = await m.reply(`${target.user.tag} muted for ${ms(time, { long: true })}`);
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
    const r = await m.reply(`${target.user.tag} unmuted`);
    autoDelete(r, 5000);
    return;
  }

  if (cmd === "slowmode") {
    if (!m.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return m.react("❌");
    const sec = Math.min(parseInt(args[0] || "0", 10), 21600);
    await m.channel.setRateLimitPerUser(sec).catch(() => {});
    const r = await m.reply(`Slow-mode set to **${sec}s**`);
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

  /* -------- AFK + SNIPES -------- */
  if (cmd === "afk") {
    const reason = args.join(" ") || "AFK";
    client.afk.set(m.author.id, reason);
    const r = await m.reply(`I set you AFK: ${reason}`);
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
    await m.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x8b00ff)
          .setAuthor({ name: msg.author.tag, iconURL: msg.author.displayAvatarURL() })
          .setDescription(msg.content || " ")
          .setTimestamp(msg.createdAt),
      ],
    });
    return;
  }

  if (cmd === "editsnipe") {
    const msg = client.editSnipe.get(m.channel.id);
    if (!msg) {
      const r = await m.reply("nothing to editsnipe");
      autoDelete(r, 5000);
      return;
    }
    await m.channel.send({
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
    return;
  }

  /* -------- HELP (EMBED STAYS) -------- */
  if (cmd === "help") {
    await m.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x8b00ff)
          .setTitle("WOCKHARDT COMMANDS (Staff Only)")
          .setDescription(
            [
              `**Core:** -wock -sip -verify -verifycam -count -leaderboard -wockstats`,
              `**Test:** -testwelcome1 -testwelcome2`,
              `**Fun:** -lean -gif -8cup -pickup -iq -ship -coinflip -roll -reverse -mock -emojify -drank`,
              `**Social:** -compliment -insult -dadjoke -quote -fact`,
              `**API Fun:** -joke -meme -cat -dog`,
              `**Tools:** -weather -translate -minecraft -qr -shorten -calc -binary -password`,
              `**Info:** -serverinfo -userinfo -avatar -emoji -servericon -channelinfo`,
              `**Mod:** -clear -say -embed -mute -unmute -slowmode -lock -unlock`,
              `**Note:** Verify BUTTON is public • Embeds never delete`,
            ].join("\n")
          ),
      ],
    });
    return;
  }

  // unknown command (deletes)
  const unk = await m.reply("unknown command");
  autoDelete(unk, 5000);
});

/* ---------- VERIFY BUTTON (PUBLIC) ---------- */
client.on("interactionCreate", async (i) => {
  if (!i.isButton() || i.customId !== "verify_btn") return;

  const role = i.guild.roles.cache.find((r) => r.name.toLowerCase() === "verified");
  if (!role) return i.reply({ content: "⚠️ Verified role not found.", ephemeral: true });
  if (i.member.roles.cache.has(role.id)) return i.reply({ content: "You're already verified.", ephemeral: true });

  await i.member.roles.add(role).catch(() => {});
  return i.reply({ content: "✅ Verified—welcome to WOCKHARDT!", ephemeral: true });
});

/* ---------- LOGIN ---------- */
client.login(TOKEN);
