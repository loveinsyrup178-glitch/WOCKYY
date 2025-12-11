const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.GuildMember]
});

// Log when bot is ready
client.once("ready", () => {
    console.log("Wockhardt Welcome Bot is online!");
});

// Put the channel ID where the welcome message should be sent
const WELCOME_CHANNEL = "1446428371595821167";

client.on("guildMemberAdd", async (member) => {

    const embed = new EmbedBuilder()
        .setTitle("💟 WOCKHARDT 💟")
        .setDescription(
`✨ Welcome to the Wock Zone, ${member} ✨

• 18+ only – stay active, don’t be dry  
• Need a VC? Tap below:  
Create Your VC: https://discord.com/channels/1446420100151382131/1447154911627186206

• Intro Video:  
Wockhardt Video: https://discord.com/channels/1446420100151382131/1447035798930325574/144845260
`
        )
        .setColor("#9b59b6")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL);
    if (channel) channel.send({ embeds: [embed] });
});

client.login(process.env.TOKEN);
