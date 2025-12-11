const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.GuildMember]
});

// Welcome channel
const WELCOME_CHANNEL = "1446428371595821167";

// Real VC link
const VC_LINK = "https://discord.com/channels/1446420100151382131/1447154911627186206";

// Roles
const PURPLE_ROLE = "1448654794259435614";
const RED_ROLE = "1448654699187277875";

// Videos
const PURPLE_VIDEO = "https://youtu.be/vXvqB2AiAio?si=jgnFkcsP4xx4PcOP";
const RED_VIDEO = "https://youtu.be/NLhfOd1QmWs?si=vFr0jJsfBq_fIRVJ";

client.once("ready", () => {
    console.log("Wockhardt Welcome Bot is online!");
});

// =============================================
//               REAL WELCOME
// =============================================
client.on("guildMemberAdd", async (member) => {

    // Random pick
    const choices = ["purple", "red"];
    const pick = choices[Math.floor(Math.random() * choices.length)];

    let role = "";
    let video = "";
    let color = "";

    if (pick === "purple") {
        role = PURPLE_ROLE;
        video = PURPLE_VIDEO;
        color = "#9b59b6";
    } else {
        role = RED_ROLE;
        video = RED_VIDEO;
        color = "#ff003c";
    }

    // Assign chosen role
    member.roles.add(role).catch(() => {});

    // Get channel
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL);
    if (!channel) return;

    // Send video as a separate message (so Discord shows preview)
    await channel.send(video);

    // Build embed
    const embed = new EmbedBuilder()
        .setTitle("𐌕𐌕・𝙒 𝙊 𝘾 𝙆 𝙃 𝘼 𝙍 𝘿 𝙏")
        .setDescription(
`✦ Welcome to the Wock Zone, ${member} ✦

• 18+ only  
• Stay active — don’t be dry  

• Your personal VC:  
→ ${VC_LINK}
`
        )
        .setColor(color)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

    await channel.send({ embeds: [embed] });
});

// =============================================
//                TEST COMMANDS
// =============================================
client.on("messageCreate", async (msg) => {
    if (!msg.guild) return;
    if (msg.author.bot) return;

    const OWNER = msg.guild.ownerId;
    if (msg.author.id !== OWNER) return;

    const channel = msg.channel;

    // TEST PURPLE
    if (msg.content.toLowerCase() === "!testpurple") {

        msg.member.roles.add(PURPLE_ROLE).catch(() => {});

        await channel.send(PURPLE_VIDEO);

        const embed = new EmbedBuilder()
            .setTitle("𐌕𐌕・𝙒 𝙊 𝘾 𝙆 𝙃 𝘼 𝙍 𝘿 𝙏 — TEST (PURPLE)")
            .setDescription(
`✦ Welcome to the Wock Zone ✦

• 18+ only  
• Stay active — don’t be dry  

• Your personal VC:  
→ ${VC_LINK}
`
            )
            .setColor("#9b59b6")
            .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    }

    // TEST RED
    if (msg.content.toLowerCase() === "!testred") {

        msg.member.roles.add(RED_ROLE).catch(() => {});

        await channel.send(RED_VIDEO);

        const embed = new EmbedBuilder()
            .setTitle("𐌕𐌕・𝙒 𝙊 𝘾 𝙆 𝙃 𝘼 𝙍 𝘿 𝙏 — TEST (RED)")
            .setDescription(
`✦ Welcome to the Wock Zone ✦

• 18+ only  
• Stay active — don’t be dry  

• Your personal VC:  
→ ${VC_LINK}
`
            )
            .setColor("#ff003c")
            .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    }
});

client.login(process.env.TOKEN);
