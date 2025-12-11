const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Partials 
} = require("discord.js");

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

// Real VC link + Create VC link (replace if needed)
const VC_LINK = "https://discord.com/channels/1446420100151382131/1447154911627186206";
const CREATE_VC_LINK = "https://discord.com/channels/1446420100151382131/1447035798930325574";

// Roles
const PURPLE_ROLE = "1448654794259435614";
const RED_ROLE = "1448654699187277875";

// GIFs (inside embed)
const PURPLE_GIF = "https://cdn.discordapp.com/attachments/1447035798930325574/1448660205079498772/2604FF98-090D-4614-8C4B-E3800DE7278D.gif";
const RED_GIF = "https://cdn.discordapp.com/attachments/1447035798930325574/1448661497713790998/C933D366-8D32-4C95-B492-C791CC70E9DF.gif";

client.once("ready", () => {
    console.log("Wockhardt Welcome Bot is online!");
});

// =========================================================
//                    REAL WELCOME
// =========================================================
client.on("guildMemberAdd", async (member) => {

    const picks = ["purple", "red"];
    const pick = picks[Math.floor(Math.random() * picks.length)];

    let role, color, gif;

    if (pick === "purple") {
        role = PURPLE_ROLE;
        color = "#9b59b6";
        gif = PURPLE_GIF;
    } else {
        role = RED_ROLE;
        color = "#ff003c";
        gif = RED_GIF;
    }

    member.roles.add(role).catch(() => {});

    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL);
    if (!channel) return;

    // Create button row
    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel("JOIN VC")
                .setStyle(ButtonStyle.Link)
                .setURL(VC_LINK),
            new ButtonBuilder()
                .setLabel("CREATE VC")
                .setStyle(ButtonStyle.Link)
                .setURL(CREATE_VC_LINK)
        );

    const embed = new EmbedBuilder()
        .setTitle("𐌕𐌕・𝙒 𝙊 𝘾 𝙆 𝙃 𝘼 𝙍 𝘿 𝙏")
        .setDescription(
`welcome to wockhardt, ${member}

inv 3 for perms • stay active`
        )
        .setColor(color)
        .setImage(gif)
        .setTimestamp()
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

    await channel.send({ embeds: [embed], components: [buttons] });
});

// =========================================================
//                  TEST COMMANDS
// =========================================================
client.on("messageCreate", async (msg) => {
    if (!msg.guild) return;
    if (msg.author.bot) return;

    const OWNER = msg.guild.ownerId;
    if (msg.author.id !== OWNER) return;

    const channel = msg.channel;

    const makeEmbed = (color, gif) =>
        new EmbedBuilder()
            .setTitle("𐌕𐌕・𝙒 𝙊 𝘾 𝙆 𝙃 𝘼 𝙍 𝘿 𝙏 — TEST")
            .setDescription(
`welcome to wockhardt, ${msg.author}

inv 3 for perms • stay active`
            )
            .setColor(color)
            .setImage(gif)
            .setTimestamp()
            .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }));

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel("JOIN VC")
                .setStyle(ButtonStyle.Link)
                .setURL(VC_LINK),
            new ButtonBuilder()
                .setLabel("CREATE VC")
                .setStyle(ButtonStyle.Link)
                .setURL(CREATE_VC_LINK)
        );

    if (msg.content === "!testpurple") {
        msg.member.roles.add(PURPLE_ROLE).catch(() => {});
        await channel.send({ embeds: [makeEmbed("#9b59b6", PURPLE_GIF)], components: [buttons] });
    }

    if (msg.content === "!testred") {
        msg.member.roles.add(RED_ROLE).catch(() => {});
        await channel.send({ embeds: [makeEmbed("#ff003c", RED_GIF)], components: [buttons] });
    }
});

client.login(process.env.TOKEN);
