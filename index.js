const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    Partials,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    Routes,
    REST
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.GuildMember]
});

// SETTINGS
const WELCOME_CHANNEL = "1446420100822335633"; 
const VC_LINK = "https://discord.gg/AV58C6AwT";
const MAIN_CHAT_LINK = "https://discord.com/channels/1446420100151382131/1446428371595821167";

// ROLES
const PURPLE_ROLE = "1448654794259435614";
const RED_ROLE = "1448654699187277875";

// CLEAN GIF LINKS
const PURPLE_GIF = "https://cdn.discordapp.com/attachments/1447035798930325574/1448678742225326221/1B071050-EBBC-499A-9766-0B1B8EA76E04.gif";
const RED_GIF = "https://cdn.discordapp.com/attachments/1447035798930325574/1448684013458817117/705C1CE2-E35E-4FC5-9DFC-0F9B05CB1F52.gif";

// EMBED BUILDER FUNCTION (no visible link)
function buildWelcomeEmbed(member, role, gif) {
    const color = role === PURPLE_ROLE ? "#8A2BE2" : "#B00000";

    return new EmbedBuilder()
        .setTitle("𝘞𝘖𝘊𝘒𝘏𝘈𝘙𝘋𝘛 𝘞𝘌𝘓𝘊𝘖𝘔𝘌 ✦")
        .setDescription(
`𝘞𝘦𝘭𝘤𝘰𝘮𝘦 𝘵𝘰 𝘵𝘩𝘦 𝘞𝘰𝘤𝘬 𝘡𝘰𝘯𝘦, ${member}

✦ 𝘴𝘵𝘢𝘺 𝘢𝘤𝘵𝘪𝘷𝘦  
✦ 𝘪𝘯𝘷 𝟯 𝘧𝘰𝘳 𝘱𝘦𝘳𝘮𝘴  
✦ 𝘧𝘦𝘦𝘭 𝘢𝘵 𝘩𝘰𝘮𝘦`
        )
        .setImage(gif) // GIF shows clean, no link text
        .setColor(color)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
}

// BUTTONS ROW
function buildButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel("CREATE VC")
            .setStyle(ButtonStyle.Link)
            .setURL(VC_LINK),
        new ButtonBuilder()
            .setLabel("MAIN CHAT")
            .setStyle(ButtonStyle.Link)
            .setURL(MAIN_CHAT_LINK)
    );
}

// REAL JOIN EVENT
client.on("guildMemberAdd", async (member) => {
    const roles = [PURPLE_ROLE, RED_ROLE];
    const selected = roles[Math.floor(Math.random() * roles.length)];

    const gif = selected === PURPLE_ROLE ? PURPLE_GIF : RED_GIF;
    const embed = buildWelcomeEmbed(member, selected, gif);
    const buttons = buildButtons();

    await member.roles.add(selected).catch(() => {});

    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL);
    if (channel) channel.send({ embeds: [embed], components: [buttons] });
});

// SLASH COMMANDS
const commands = [
    new SlashCommandBuilder()
        .setName("testpurple")
        .setDescription("Send the purple welcome embed"),
    new SlashCommandBuilder()
        .setName("testred")
        .setDescription("Send the red welcome embed")
].map(cmd => cmd.toJSON());

client.on("ready", async () => {
    console.log("WOCKHARDT Welcome Bot is online!");

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
    );

    console.log("Commands registered.");
});

// TEST COMMAND HANDLER
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const member = interaction.member;
    const channel = interaction.guild.channels.cache.get(WELCOME_CHANNEL);

    if (!channel) return interaction.reply({ content: "Welcome channel missing!", ephemeral: true });

    let role, gif;

    if (interaction.commandName === "testpurple") {
        role = PURPLE_ROLE;
        gif = PURPLE_GIF;
    }

    if (interaction.commandName === "testred") {
        role = RED_ROLE;
        gif = RED_GIF;
    }

    await member.roles.add(role).catch(() => {});

    const embed = buildWelcomeEmbed(member, role, gif);

    channel.send({ embeds: [embed], components: [buildButtons()] });

    interaction.reply({ content: "Sent!", ephemeral: true });
});

client.login(process.env.TOKEN);
