/*  WOCKHARDT-BOT v2 – Bleed-style, KEYLESS + Railway-safe (no FFmpeg required)
    24/7 VC optional (ENABLE_VOICE=true) | ,wock | djs v14
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
const VERIFY_CH = process.env.VERIFY_CH || "1449275035020689458";
const IDLE_VC_ID = process.env.IDLE_VC_ID || "1447154877150265466";
const PURPLE_ROLE = process.env.PURPLE_ROLE || "1448654794259435614";
const RED_ROLE = process.env.RED_ROLE || "1448654699187277875";
const GUILD_ID = process.env.GUILD_ID; // optional but recommended
const TOKEN = process.env.TOKEN;

if (!TOKEN) throw new Error("Missing TOKEN (set it in Railway Variables or .env)");

/* ---------- OPTIONAL VOICE (Railway-safe) ---------- */
const ENABLE_VOICE = String(process.env.ENABLE_VOICE || "false").toLowerCase() === "true";

// Only require voice if user explicitly enables it.
// This prevents Railway FFmpeg crashes by default.
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
    GatewayIntentBits.GuildInvites,
  ],
  partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User],
});

/* ---------- UTILS ---------- */
const PREFIX = "-";
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const isMod = (m) => m.member.permissions.has(PermissionsBitField.Flags.ManageMessages);

/* ---------- 24/7 VC (OPTIONAL) ---------- */
async function joinIdleVC(guild) {
  if (!voice) return; // voice disabled
  try {
    const {
      joinVoiceChannel,
      createAudioPlayer,
      createAudioResource,
      NoSubscriberBehavior,
      AudioPlayerStatus,
    } = voice;

    const vc = guild.channels.cache.get(IDLE_VC_ID);
    if (!vc || (vc.type !== ChannelType.GuildVoice && vc.type !== ChannelType.GuildStageVoice)) return;

    // NOTE: this requires ffmpeg if you play audio; on Railway you'll need ffmpeg installed.
    // If you enable voice on Railway, add ffmpeg via nixpacks.
    const SILENCE = createAudioResource("./silence.mp3");

    const conn = joinVoiceChannel({
      channelId: vc.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false,
    });

    const player = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Play },
    });

    player.play(SILENCE);
    conn.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => player.play(SILENCE));
    player.on("error", () => player.play(SILENCE));

    console.log("🎧 Joined idle VC:", vc.name);
  } catch (e) {
    console.warn("⚠️ Voice join failed (likely missing ffmpeg). Disable ENABLE_VOICE or install ffmpeg.", e?.message);
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

function buildVerifyEmbed() {
  return new EmbedBuilder()
    .setColor(0x8b00ff)
    .setTitle("⛧ 𐌕𐌕・𝐖𝐎𝐂𝐊𝐇𝐀𝐑𝐃𝐓 ・ Verification ⛧")
    .setDescription("Welcome, sipper.\nTap the lean cup below to verify & unlock the rest of the server.")
    .setImage("https://cdn.discordapp.com/attachments/1447035798930325574/1449276801405816995/IMG_4631.png")
    .setFooter({ text: "Verification required • WOCKHARDT" });
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
    .setEmoji("1376495549179756607")
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

  // Prefer a specific guild if provided; otherwise just skip the auto-post.
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

/* ---------- MEMBER JOIN ---------- */
client.on("guildMemberAdd", async (m) => {
  const roles = [PURPLE_ROLE, RED_ROLE];
  const pick = roles[Math.floor(Math.random() * roles.length)];

  const gif =
    pick === PURPLE_ROLE
      ? "https://cdn.discordapp.com/attachments/1447035798930325574/1448678742225326221/1B071050-EBBC-499A-9766-0B1B8EA76E04.gif"
      : "https://cdn.discordapp.com/attachments/1447035798930325574/1448684013458817117/705C1CE2-E35E-4FC5-9DFC-0F9B05CB1F52.gif";

  await m.roles.add(pick).catch(() => {});
  const ch = m.guild.channels.cache.get(WELCOME_CH);
  if (ch && ch.isTextBased()) ch.send({ embeds: [buildWelcomeEmbed(m, pick, gif)], components: [rowLinks] });
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
  if (!m.content.startsWith(PREFIX)) return;

  const args = m.content.slice(PREFIX.length).trim().split(/\s+/);
  const cmd = (args.shift() || "").toLowerCase();

  /* CORE */
  if (cmd === "wock") {
    const role = m.guild.roles.cache.find((r) => r.name.toLowerCase() === "wock");
    if (!role) return m.reply("Wock role not found.");
    if (m.member.roles.cache.has(role.id)) return m.reply("You already got the wock 🥤");

    try {
      await m.member.roles.add(role);
      await m.member.setNickname(`⟦𝙬𝙤𝙘𝙠⟧ 🥤 ${m.author.username}`);
      return m.reply(`Wock tag applied 🥤  **${m.member.displayName}**`);
    } catch (e) {
      return m.reply(`❌ ${e.message}`);
    }
  }

  if (cmd === "verify") {
    return m.channel.send({ embeds: [buildVerifyEmbed()], components: [rowVerify] });
  }

  /* FUN */
  if (cmd === "lean") return m.channel.send({ files: [rand(GIFS)] });
  if (cmd === "gif") return m.reply(rand(GIFS)); // keyless fallback
  if (cmd === "8cup") return m.reply(`🎱 **${rand(EIGHT)}**`);
  if (cmd === "pickup") return m.reply(rand(PICKUPS));

  if (cmd === "iq") {
    const who = m.mentions.users.first() || m.author;
    return m.reply(`${who} IQ is **${Math.floor(Math.random() * 200)}**`);
  }

  if (cmd === "ship") {
    const a = m.mentions.users.first();
    const b = m.mentions.users.last();
    if (!a || !b || a.id === b.id) return m.reply("tag two different users");
    const score = Math.floor(Math.random() * 101);
    return m.reply(`💜 **${a.username}** × **${b.username}** ➜ **${score}%**`);
  }

  if (cmd === "coinflip") return m.reply(`🪙 **${Math.random() > 0.5 ? "Heads" : "Tails"}**`);

  if (cmd === "roll") {
    const n = Math.max(2, Math.min(parseInt(args[0] || "6", 10), 1000000));
    return m.reply(`🎲 **${Math.floor(Math.random() * n) + 1}** (1-${n})`);
  }

  if (cmd === "reverse") return m.reply(args.join(" ").split("").reverse().join(""));

  if (cmd === "mock") {
    const t = args.join(" ");
    return m.reply(t.split("").map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join(""));
  }

  if (cmd === "emojify") {
    const map = {
      a: "🇦", b: "🇧", c: "🇨", d: "🇩", e: "🇪", f: "🇫", g: "🇬", h: "🇭", i: "🇮", j: "🇯",
      k: "🇰", l: "🇱", m: "🇲", n: "🇳", o: "🇴", p: "🇵", q: "🇶", r: "🇷", s: "🇸", t: "🇹",
      u: "🇺", v: "🇻", w: "🇼", x: "🇽", y: "🇾", z: "🇿",
    };
    return m.reply(args.join(" ").toLowerCase().split("").map((c) => map[c] || c).join(" "));
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
    return m.reply(`🥤 **${w ? w.members.size : 0}** sippers right now`);
  }

  if (cmd === "leaderboard") {
    const purp = m.guild.roles.cache.get(PURPLE_ROLE)?.members.map((mm) => mm.user.tag) || [];
    const red = m.guild.roles.cache.get(RED_ROLE)?.members.map((mm) => mm.user.tag) || [];

    const lines = ["**Leaderboard**"];
    purp.forEach((u, i) => lines.push(`${i + 1}. 🟣 ${u}`));
    red.forEach((u, i) => lines.push(`${purp.length + i + 1}. 🔴 ${u}`));

    return m.channel.send(lines.join("\n").slice(0, 2000));
  }

  if (cmd === "wockstats") {
    const g = m.guild;
    const stats = {
      purp: g.roles.cache.get(PURPLE_ROLE)?.members.size || 0,
      red: g.roles.cache.get(RED_ROLE)?.members.size || 0,
      wock: g.roles.cache.find((r) => r.name.toLowerCase() === "wock")?.members.size || 0,
      verified: g.roles.cache.find((r) => r.name.toLowerCase() === "verified")?.members.size || 0,
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

// ignore every /command unless it’s from the owner
if (m.content.startsWith("/") && m.author.id !== "YOUR_DISCORD_ID") return;

  /* SOCIAL */
  if (cmd === "compliment") {
    const who = m.mentions.users.first() || m.author;
    return m.reply(`${who} ${rand(COMPLIMENTS)}`);
  }

  if (cmd === "insult") {
    const who = m.mentions.users.first() || m.author;
    const data = await fetch("https://evilinsult.com/generate_insult.php?lang=en&type=json")
      .then((r) => r.json())
      .catch(() => null);
    return m.reply(`${who} ${data?.insult || "you got a weak pour."}`);
  }

  if (cmd === "dadjoke") {
    const d = await fetch("https://icanhazdadjoke.com/", { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .catch(() => null);
    return m.reply(d?.joke || "I had a joke… but I spilled it in the cup 😭");
  }

  if (cmd === "quote") {
    const q = await fetch("https://type.fit/api/quotes").then((r) => r.json()).catch(() => []);
    const pick = q?.length ? rand(q) : { text: "Stay solid.", author: "WOCK" };
    return m.reply(`“${pick.text}” — ${pick.author || "Unknown"}`);
  }

  if (cmd === "fact") {
    const f = await fetch("https://uselessfacts.jsph.pl/random.json?language=en").then((r) => r.json()).catch(() => null);
    return m.reply(f?.text || "Fun fact: you still a legend.");
  }

  /* API FUN (KEYLESS) */
  if (cmd === "joke") {
    const j = await fetch("https://official-joke-api.appspot.com/random_joke").then((r) => r.json()).catch(() => null);
    if (!j) return m.reply("no jokes rn");
    return m.reply({ embeds: [new EmbedBuilder().setColor(0x8b00ff).setTitle(j.setup).setDescription(j.punchline)] });
  }

  if (cmd === "meme") {
    const meme = await fetch("https://meme-api.com/gimme").then((r) => r.json()).catch(() => null);
    if (!meme?.url) return m.reply("no meme rn");
    return m.reply({ embeds: [new EmbedBuilder().setTitle(meme.title || "meme").setImage(meme.url).setColor(0x8b00ff)] });
  }

  if (cmd === "cat") {
    const url = (await fetch("https://api.thecatapi.com/v1/images/search").then((r) => r.json()).catch(() => []))?.[0]?.url;
    return url ? m.reply({ files: [url] }) : m.reply("no cat rn");
  }

  if (cmd === "dog") {
    const url = (await fetch("https://api.thedogapi.com/v1/images/search").then((r) => r.json()).catch(() => []))?.[0]?.url;
    return url ? m.reply({ files: [url] }) : m.reply("no dog rn");
  }

  /* TOOLS (KEYLESS) */
  if (cmd === "translate") {
    const [fromTo, ...text] = args;
    if (!fromTo || !text.length) return m.reply(`use: ${PREFIX}translate es|en hola`);
    const [from, to] = fromTo.split("|");
    if (!from || !to) return m.reply(`use: ${PREFIX}translate es|en hola`);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.join(" "))}&langpair=${from}|${to}`;
    const data = await fetch(url).then((r) => r.json()).catch(() => null);
    return m.reply(data?.responseData?.translatedText || "couldn’t translate that rn");
  }

  if (cmd === "weather") {
    const city = args.join(" ");
    if (!city) return m.reply(`use: ${PREFIX}weather austin`);
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
    const data = await fetch(url).then((r) => r.json()).catch(() => null);
    if (!data?.current_condition?.[0]) return m.reply("city not found");
    const c = data.current_condition[0];
    return m.reply({
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
  }

  if (cmd === "minecraft") {
    const ip = args[0];
    if (!ip) return m.reply(`use: ${PREFIX}minecraft play.hypixel.net`);
    const data = await fetch(`https://api.mcsrvstat.us/2/${encodeURIComponent(ip)}`).then((r) => r.json()).catch(() => null);
    if (!data?.online) return m.reply("server offline / not found");
    return m.reply({
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
  }

  if (cmd === "qr") {
    const txt = args.join(" ");
    if (!txt) return m.reply(`use: ${PREFIX}qr wockhardt`);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(txt)}`;
    return m.reply({ files: [url] });
  }

  if (cmd === "shorten") {
    const url = args[0];
    if (!url) return m.reply(`use: ${PREFIX}shorten https://...`);
    const data = await fetch(`https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(url)}`).then((r) => r.json()).catch(() => null);
    if (!data?.ok) return m.reply("couldn’t shorten that");
    return m.reply(data.result.full_short_link);
  }

  if (cmd === "calc") {
    const expr = args.join(" ");
    if (!expr) return m.reply(`use: ${PREFIX}calc (2+2)*5`);
    try {
      const safe = expr.replace(/[^0-9+\-*/().\s]/g, "");
      const ans = Function(`"use strict"; return (${safe});`)();
      return m.reply(`🧮 ${expr} = **${ans}**`);
    } catch {
      return m.reply("invalid math");
    }
  }

  if (cmd === "binary") {
    const txt = args.join(" ");
    if (!txt) return m.reply(`use: ${PREFIX}binary hello`);
    return m.reply(txt.split("").map((c) => c.charCodeAt(0).toString(2)).join(" "));
  }

  if (cmd === "password") {
    const len = Math.max(6, Math.min(parseInt(args[0] || "16", 10), 64));
    const pass = [...Array(len)].map(() => Math.random().toString(36).slice(-1)).join("");
    await m.author.send(`🔑 **${pass}**`).catch(() => {});
    return m.reply("DM sent");
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
            { name: "Members", value: `${g.memberCount}`, inline: true },
            { name: "Roles", value: `${g.roles.cache.size}`, inline: true },
            { name: "Boost", value: `Tier ${g.premiumTier}`, inline: true },
            { name: "Created", value: g.createdAt.toDateString(), inline: true }
          )
          .setThumbnail(g.iconURL({ dynamic: true })),
      ],
    });
  }

  if (cmd === "userinfo") {
    const u = m.mentions.users.first() || m.author;
    const mm = await m.guild.members.fetch(u.id).catch(() => null);
    if (!mm) return m.reply("user not found");
    return m.reply({
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
  }

  if (cmd === "avatar") {
    const u = m.mentions.users.first() || m.author;
    return m.reply({ files: [u.displayAvatarURL({ size: 4096, dynamic: true })] });
  }

  if (cmd === "emoji") {
    const emo = m.content.split(" ").slice(1).find((e) => e.startsWith("<"));
    if (!emo) return m.reply("send an emoji like <:name:id>");
    const match = emo.match(/<(a)?:(\w+):(\d+)>/);
    if (!match) return m.reply("invalid emoji");
    const url = `https://cdn.discordapp.com/emojis/${match[3]}${match[1] ? ".gif" : ".png"}?size=4096`;
    return m.reply({ files: [url] });
  }

  if (cmd === "servericon") {
    const icon = m.guild.iconURL({ size: 4096, dynamic: true });
    return icon ? m.reply({ files: [icon] }) : m.reply("no icon");
  }

  if (cmd === "channelinfo") {
    const c = m.channel;
    return m.reply({
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
  }

  /* MOD */
  if (cmd === "clear") {
    if (!m.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return m.react("❌");
    const n = Math.min(parseInt(args[0] || "1", 10), 100);
    await m.channel.bulkDelete(n + 1, true).catch(() => {});
    const msg = await m.channel.send(`🧹 ${n} gone`);
    setTimeout(() => msg.delete().catch(() => {}), 3000);
    return;
  }

  if (cmd === "say") {
    if (!isMod(m)) return m.react("❌");
    const txt = args.join(" ");
    if (!txt) return;
    await m.channel.send(txt);
    return m.delete().catch(() => {});
  }

  if (cmd === "embed") {
    if (!isMod(m)) return m.react("❌");
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
    if (!target) return m.reply("tag someone");
    const time = ms(args[1] || "1m");
    await target.timeout(time).catch((e) => m.reply(`❌ ${e.message}`));
    return m.reply(`${target.user.tag} muted for ${ms(time, { long: true })}`);
  }

  if (cmd === "unmute") {
    if (!m.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return m.react("❌");
    const target = m.mentions.members.first();
    if (!target) return m.reply("tag someone");
    await target.timeout(null).catch((e) => m.reply(`❌ ${e.message}`));
    return m.reply(`${target.user.tag} unmuted`);
  }

  if (cmd === "slowmode") {
    if (!m.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return m.react("❌");
    const sec = Math.min(parseInt(args[0] || "0", 10), 21600);
    await m.channel.setRateLimitPerUser(sec).catch(() => {});
    return m.reply(`Slow-mode set to **${sec}s**`);
  }

  if (cmd === "lock") {
    if (!m.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return m.react("❌");
    await m.channel.permissionOverwrites.edit(m.guild.id, { SendMessages: false }).catch(() => {});
    return m.reply("🔒 Channel locked");
  }

  if (cmd === "unlock") {
    if (!m.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return m.react("❌");
    await m.channel.permissionOverwrites.edit(m.guild.id, { SendMessages: true }).catch(() => {});
    return m.reply("🔓 Channel unlocked");
  }

  /* AFK + SNIPES */
  if (cmd === "afk") {
    const reason = args.join(" ") || "AFK";
    client.afk.set(m.author.id, reason);
    return m.reply(`I set you AFK: ${reason}`);
  }

  if (cmd === "snipe") {
    const msg = client.snipe.get(m.channel.id);
    if (!msg) return m.reply("nothing to snipe");
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
    if (!msg) return m.reply("nothing to editsnipe");
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

  /* HELP */
  if (cmd === "help") {
    return m.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x8b00ff)
          .setTitle("WOCKHARDT COMMANDS (Railway Safe)")
          .setDescription(
            [
              `**Core:** ,wock ,verify ,count ,leaderboard ,wockstats`,
              `**Fun:** ,lean ,gif ,8cup ,pickup ,iq ,ship ,coinflip ,roll ,reverse ,mock ,emojify ,drank`,
              `**Social:** ,compliment ,insult ,dadjoke ,quote ,fact`,
              `**Tools:** ,weather ,translate ,minecraft ,qr ,shorten ,calc ,binary ,password`,
              `**Info:** ,serverinfo ,userinfo ,avatar ,emoji ,servericon ,channelinfo`,
              `**Mod:** ,clear ,say ,embed ,mute ,unmute ,slowmode ,lock ,unlock`,
              `**Voice:** optional (ENABLE_VOICE=true + ffmpeg required)`,
            ].join("\n")
          ),
      ],
    });
  }
});

/* ---------- VERIFY BUTTON ---------- */
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
