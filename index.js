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

// =========================================================
//                UPDATED WELCOME CHANNEL
// =========================================================
const WELCOME_CHANNEL = "1446420100822335633";

// Button links
const CREATE_VC_LINK = "https://discord.com/channels/1446420100151382131/1447154911627186206";
const MAIN_CHAT_LINK = "https://discord.com/channels/1446420100151382131/1446420100822335633";

// Roles
const PURPLE_ROLE = "1448654794259435614";
const RED_ROLE = "1448654699187277875";

// FINAL GIFs
const PURPLE_GIF = "https://cdn.discordapp.com/attachments/1447035798930325574/1448679023889874964/1B071050-EBBC-499A-9766-0B1B8EA76E04.gif";
const RED_GIF = "https://cdn.discordapp.com/attachments/1447035798930325574/1448678747610943571/705C1CE2-E35E-4FC5-9DFC-0F9B05CB1F52.gif";

client.once("ready", () => {
    console.log("Wockhardt Welcome Bot is ONLINE");
});

// =========================================================
//                    REAL WELCOME EVENT
// =========================================================
client.on("guildMemberAdd", async (member) => {

    const picks = ["purple", "red"];
    const pick = picks[Math.floor(Math.random() * picks.length)];

    let role, gif, color;

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

    // Buttons (ONE ROW, TWO BUTTONS)
    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel("CREATE VC")
            .setStyle(ButtonStyle.Link)
            .setURL(CREATE_VC_LINK),
        new ButtonBuilder()
            .setLabel("MAIN CHAT")
            .setStyle(ButtonStyle.Link)
            .setURL(MAIN_CHAT_LINK)
    );

    // Deluxe Embed (Placement B)
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
//                      TEST COMMANDS
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

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel("CREATE VC")
            .setStyle(ButtonStyle.Link)
            .setURL(CREATE_VC_LINK),
        new ButtonBuilder()
            .setLabel("MAIN CHAT")
            .setStyle(ButtonStyle.Link)
            .setURL(MAIN_CHAT_LINK)
    );

    if (msg.content === "!testpurple") {
        msg.member.roles.add(PURPLE_ROLE).catch(() => {});
        await channel.send({
            embeds: [makeEmbed("#9b59b6", PURPLE_GIF)],
            components: [buttons]
        });
    }

    if (msg.content === "!testred") {
        msg.member.roles.add(RED_ROLE).catch(() => {});
        await channel.send({
            embeds: [makeEmbed("#ff003c", RED_GIF)],
            components: [buttons]
        });
    }
});

client.login(process.env.TOKEN);
