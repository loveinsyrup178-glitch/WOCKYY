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

// Real VC invite link
const VC_INVITE_LINK = "https://discord.gg/AV58C6AwT";

// Roles
const PURPLE_ROLE = "1448654794259435614";
const RED_ROLE = "1448654699187277875";

// Videos
const PURPLE_VIDEO = "https://youtu.be/vXvqB2AiAio?si=jgnFkcsP4xx4PcOP";
const RED_VIDEO = "https://youtu.be/NLhfOd1QmWs?si=vFr0jJsfBq_fIRVJ";

client.once("ready", () => {
    console.log("Wockhardt Welcome Bot is online!");
});

// =============================
//          REAL WELCOME
// =============================
client.on("guildMemberAdd", async (member) => {

    const choices = ["purple", "red"];
    const pick = choices[Math.floor(Math.random() * choices.length)];

    let color = "";
    let video = "";
    let roleID = "";

    if (pick === "purple") {
        color = "#9b59b6";
        video = PURPLE_VIDEO;
        roleID = PURPLE_ROLE;
    } else {
        color = "#ff003c";
        video = RED_VIDEO;
        roleID = RED_ROLE;
    }

    if (roleID) member.roles.add(roleID).catch(() => {});

    const embed = new EmbedBuilder()
        .setTitle("𐌕𐌕・𝐖𝐎𝐂𝐊𝐇𝐀𝐑𝐃𝐓")
        .setDescription(
`✦ Welcome to the Wock Zone, ${member} ✦

• 18+ only  
• Stay active — don’t be dry  

• Your personal VC:  
→ ${VC_INVITE_LINK}

• Intro Video:  
→ ${video}
`
        )
        .setColor(color)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL);
    if (channel) channel.send({ embeds: [embed] });
});

// =============================
//         TEST COMMANDS
// =============================
client.on("messageCreate", async (msg) => {
    if (!msg.guild) return;
    if (msg.author.bot) return;

    // only allow YOU to test
    const OWNER_ID = msg.guild.ownerId;
    if (msg.author.id !== OWNER_ID) return;

    // TEST PURPLE
    if (msg.content.toLowerCase() === "!testpurple") {

        msg.member.roles.add(PURPLE_ROLE).catch(() => {});

        const embed = new EmbedBuilder()
            .setTitle("𐌕𐌕・𝐖𝐎𝐂𝐊𝐇𝐀𝐑𝐃𝐓 — TEST (PURPLE)")
            .setDescription(
`✦ Welcome to the Wock Zone ✦

• 18+ only  
• Stay active — don’t be dry  

• Your personal VC:  
→ ${VC_INVITE_LINK}

• Intro Video:  
→ ${PURPLE_VIDEO}
`
            )
            .setColor("#9b59b6")
            .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        msg.channel.send({ embeds: [embed] });
    }

    // TEST RED
    if (msg.content.toLowerCase() === "!testred") {

        msg.member.roles.add(RED_ROLE).catch(() => {});

        const embed = new EmbedBuilder()
            .setTitle("𐌕𐌕・𝐖𝐎𝐂𝐊𝐇𝐀𝐑𝐃𝐓 — TEST (RED)")
            .setDescription(
`✦ Welcome to the Wock Zone ✦

• 18+ only  
• Stay active — don’t be dry  

• Your personal VC:  
→ ${VC_INVITE_LINK}

• Intro Video:  
→ ${RED_VIDEO}
`
            )
            .setColor("#ff003c")
            .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        msg.channel.send({ embeds: [embed] });
    }
});

client.login(process.env.TOKEN);
