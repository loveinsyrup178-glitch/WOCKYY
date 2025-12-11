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

// GIFs
const PURPLE_GIF = "https://cdn.discordapp.com/attachments/1447035798930325574/1448660205079498772/2604FF98-090D-4614-8C4B-E3800DE7278D.gif?ex=693c1173&is=693abff3&hm=b38667b8f6a7227d2857af539906b8b9dc90df9e63bd964f99abb7a11726da2d&";
const RED_GIF = "https://cdn.discordapp.com/attachments/1447035798930325574/1448661497713790998/C933D366-8D32-4C95-B492-C791CC70E9DF.gif?ex=693c12a7&is=693ac127&hm=8d9631e57d3fbbab12cd59be33f8d7a75dd413c203429c46d653df62c3f10834&";

client.once("ready", () => {
    console.log("Wockhardt Welcome Bot is online!");
});

// =============================================
//               REAL WELCOME
// =============================================
client.on("guildMemberAdd", async (member) => {

    const choices = ["purple", "red"];
    const pick = choices[Math.floor(Math.random() * choices.length)];

    let role = "";
    let gif = "";
    let color = "";

    if (pick === "purple") {
        role = PURPLE_ROLE;
        gif = PURPLE_GIF;
        color = "#9b59b6";
    } else {
        role = RED_ROLE;
        gif = RED_GIF;
        color = "#ff003c";
    }

    member.roles.add(role).catch(() => {});

    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL);
    if (!channel) return;

    // Send animated GIF
    await channel.send(gif);

    // Cascading dimensional embed
    const embed = new EmbedBuilder()
        .setTitle("𐌕𐌕・𝙒 𝙊 𝘾 𝙆 𝙃 𝘼 𝙍 𝘿 𝙏")
        .setDescription(
`✦ Welcome to the Wock Zone, ${member} ✦

• 18+ only  
    • stay active  
        • don’t be dry  

𐌕···· ··· ··· ·· · ·····𐌕

• Your personal VC  
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

        await channel.send(PURPLE_GIF);

        const embed = new EmbedBuilder()
            .setTitle("𐌕𐌕・𝙒 𝙊 𝘾 𝙆 𝙃 𝘼 𝙍 𝘿 𝙏 — TEST (PURPLE)")
            .setDescription(
`✦ Welcome to the Wock Zone ✦

• 18+ only  
    • stay active  
        • don’t be dry  

𐌕···· ··· ··· ·· · ·····𐌕

• Your personal VC  
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

        await channel.send(RED_GIF);

        const embed = new EmbedBuilder()
            .setTitle("𐌕𐌕・𝙒 𝙊 𝘾 𝙆 𝙃 𝘼 𝙍 𝘿 𝙏 — TEST (RED)")
            .setDescription(
`✦ Welcome to the Wock Zone ✦

• 18+ only  
    • stay active  
        • don’t be dry  

𐌕···· ··· ··· ·· · ·····𐌕

• Your personal VC  
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
