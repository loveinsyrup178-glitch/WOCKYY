const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const WELCOME_CHANNEL = "WELCOME_CHANNEL_ID";

client.on("guildMemberAdd", async (member) => {
    const embed = new EmbedBuilder()
        .setTitle("𐌕𐌕・𝐖𝐎𝐂𝐊𝐇𝐀𝐑𝐃𝐓")
        .setDescription(`⋆˚✩₊· 𖦹 Welcome to the Wock Zone, ${member} ·₊✩˚⋆

𖦹・18+ only ・ stay active, don’t be dry  
𖦹・Need a VC? Tap below:
[𝑪𝒓𝒆𝒂𝒕𝒆 𝒀𝒐𝒖𝒓 𝑽𝑪](YOUR_CREATE_VC_LINK_HERE)

𖦹・Intro Video:
[🎥 𝑾𝒐𝒄𝒌𝒉𝒂𝒓𝒅𝒕 𝑽𝒊𝒅𝒆𝒐](YOUR_VIDEO_LINK_HERE)
`)
        .setColor("#9b59b6")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL);
    if (channel) channel.send({ embeds: [embed] });
});

client.login(process.env.TOKEN);
