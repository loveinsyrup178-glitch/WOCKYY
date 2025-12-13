/* WOCKHARDT-BOT – merged 2025-12
All-in-one: welcome embeds, verification, 24/7 VC, /wock role+nick
*/
require('dotenv').config();
const {
Client,
GatewayIntentBits,
Partials,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
SlashCommandBuilder,
REST,
Routes
} = require('discord.js');

/* ---------- CLIENT ---------- */
const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildVoiceStates
],
partials: [Partials.GuildMember]
});

/* ---------- SETTINGS ---------- */
const WELCOME_CHANNEL = '1446420100822335633';
const VERIFY_CHANNEL = '1449275035020689458';
const IDLE_VC_ID = '1447154877150265466';
const VC_LINK = 'https://discord.gg/AV58C6AwT';
const MAIN_CHAT_LINK = 'https://discord.com/channels/1446420100151382131/1446428371595821167';

/* ---------- ROLES ---------- */
const PURPLE_ROLE = '1448654794259435614';
const RED_ROLE = '1448654699187277875';

/* ---------- MEDIA ---------- */
const PURPLE_GIF = 'https://cdn.discordapp.com/attachments/1447035798930325574/1448678742225326221/1B071050-EBBC-499A-9766-0B1B8EA76E04.gif';
const RED_GIF = 'https://cdn.discordapp.com/attachments/1447035798930325574/1448684013458817117/705C1CE2-E35E-4FC5-9DFC-0F9B05CB1F52.gif';
const VERIFY_IMG = 'https://cdn.discordapp.com/attachments/1447035798930325574/1449276801405816995/IMG_4631.png';

/* ---------- EMBEDS ---------- */
function buildWelcomeEmbed(member, role, gif) {
const color = role === PURPLE_ROLE ? '#8A2BE2' : '#B00000';
return new EmbedBuilder()
.setTitle('𐌕𐌕・𝐖𝐎𝐂𝐊𝐇𝐀𝐑𝐃𝐓 𝘞𝘌𝘓𝘊𝘖𝘔𝘌 ✦')
.setDescription(
`𝘞𝘦𝘭𝘤𝘰𝘮𝘦 𝘵𝘰 𝘵𝘩𝘦 𝘞𝘰𝘤𝘬 𝘡𝘰𝘯𝘦, ${member}\n\n` +
'✦ 𝘴𝘵𝘢𝘺 𝘢𝘤𝘵𝘪𝘷𝘦 \n' +
'✦ 𝘪𝘯𝘷 𝟯 𝘧𝘰𝘳 𝘱𝘦𝘳𝘮𝘴 \n' +
'✦ 𝘧𝘦𝘦𝘭 𝘢𝘵 𝘩𝘰𝘮𝘦'
)
.setImage(gif)
.setColor(color)
.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
.setTimestamp();
}

function buildVerifyEmbed() {
return new EmbedBuilder()
.setColor(0x8b00ff)
.setTitle('⛧ 𐌕𐌕・𝐖𝐎𝐂𝐊𝐇𝐀𝐑𝐃𝐓 ・ Verification ⛧')
.setDescription(
'**Welcome, sipper.**\n' +
'Tap the lean cup below to verify & unlock the rest of the server.\n\n' +
'<:whitelean:1376495549179756607> ・ <a:purplewaves:1234567890123456789>'
)
.setImage(VERIFY_IMG)
.setFooter({ text: 'Verification required • WOCKHARDT' });
}

/* ---------- BUTTONS ---------- */
function buildWelcomeButtons() {
return new ActionRowBuilder().addComponents(
new ButtonBuilder().setLabel('CREATE VC').setStyle(ButtonStyle.Link).setURL(VC_LINK),
new ButtonBuilder().setLabel('MAIN CHAT').setStyle(ButtonStyle.Link).setURL(MAIN_CHAT_LINK)
);
}

function buildVerifyButton() {
return new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId('verify_btn')
.setLabel('☆ Verify Me ☆')
.setEmoji('1376495549179756607')
.setStyle(ButtonStyle.Secondary)
);
}

/* ---------- 24/7 VC ---------- */
async function joinIdleVC(guild) {
const vc = guild.channels.cache.get(IDLE_VC_ID);
if (!vc?.isVoiceBased()) return;
try {
const conn = await vc.join();
const dispatcher = conn.play('./silence.mp3', { type: 'unknown' });
dispatcher.on('finish', () => joinIdleVC(guild));
} catch (e) {
console.log('⚠️ Could not join 24/7 VC:', e.message);
}
}

/* ---------- EVENTS ---------- */
client.on('guildMemberAdd', async member => {
const roles = [PURPLE_ROLE, RED_ROLE];
const picked = roles[Math.floor(Math.random() * roles.length)];
const gif = picked === PURPLE_ROLE ? PURPLE_GIF : RED_GIF;
await member.roles.add(picked).catch(() => {});
const ch = member.guild.channels.cache.get(WELCOME_CHANNEL);
if (ch) ch.send({ embeds: [buildWelcomeEmbed(member, picked, gif)], components: [buildWelcomeButtons()] });
});

client.once('ready', async () => {
console.log(`WOCKHARDT online as ${client.user.tag}`);
const guild = client.guilds.cache.first();
if (guild) joinIdleVC(guild);

/* slash commands */
const cmds = [
new SlashCommandBuilder().setName('wock').setDescription('Apply the wock tag'),
new SlashCommandBuilder().setName('testpurple').setDescription('Send the purple welcome embed'),
new SlashCommandBuilder().setName('testred').setDescription('Send the red welcome embed'),
new SlashCommandBuilder().setName('sendverify').setDescription('Post the verification embed (one-time setup)')
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
await rest.put(Routes.applicationCommands(client.user.id), { body: cmds });
console.log('Slash commands registered');

/* post verification embed once */
const verifyCh = guild.channels.cache.get(VERIFY_CHANNEL);
if (verifyCh) {
const msgs = await verifyCh.messages.fetch({ limit: 1 });
if (!msgs.size || !msgs.first().components.size) {
await verifyCh.send({ embeds: [buildVerifyEmbed()], components: [buildVerifyButton()] });
console.log('✅ Verification embed posted');
}
}
});

/* ---------- INTERACTIONS ---------- */
client.on('interactionCreate', async i => {
/* 1) Slash commands */
if (i.isChatInputCommand()) {
const member = i.member;
if (i.commandName === 'wock') {
const role = i.guild.roles.cache.find(r => r.name === 'wock');
if (!role) return i.reply({ content: 'Wock role not found.', ephemeral: true });
if (member.roles.cache.has(role.id))
return i.reply({ content: 'You already got the wock 🥤', ephemeral: true });
try {
await member.roles.add(role);
await member.setNickname(`⟦𝙬𝙤𝙘𝙠⟧ <:whitelean:1376495549179756607> ${member.user.username}`);
return i.reply({ content: 'Wock tag applied 🥤', ephemeral: true });
} catch {
return i.reply({ content: 'I need Manage Roles & Manage Nicknames permissions.', ephemeral: true });
}
}

const welcomeCh = i.guild.channels.cache.get(WELCOME_CHANNEL);
if (!welcomeCh) return i.reply({ content: 'Welcome channel missing!', ephemeral: true });

if (i.commandName === 'testpurple') {
await member.roles.add(PURPLE_ROLE).catch(() => {});
welcomeCh.send({ embeds: [buildWelcomeEmbed(member, PURPLE_ROLE, PURPLE_GIF)], components: [buildWelcomeButtons()] });
return i.reply({ content: 'Sent!', ephemeral: true });
}
if (i.commandName === 'testred') {
await member.roles.add(RED_ROLE).catch(() => {});
welcomeCh.send({ embeds: [buildWelcomeEmbed(member, RED_ROLE, RED_GIF)], components: [buildWelcomeButtons()] });
return i.reply({ content: 'Sent!', ephemeral: true });
}
if (i.commandName === 'sendverify') {
const verifyCh = i.guild.channels.cache.get(VERIFY_CHANNEL);
if (!verifyCh) return i.reply({ content: 'Verification channel missing!', ephemeral: true });
await verifyCh.send({ embeds: [buildVerifyEmbed()], components: [buildVerifyButton()] });
return i.reply({ content: 'Verification embed posted!', ephemeral: true });
}
}

/* 2) Verification button */
if (i.isButton() && i.customId === 'verify_btn') {
const verifiedRole = i.guild.roles.cache.find(r => r.name.toLowerCase() === 'verified');
if (!verifiedRole) return i.reply({ content: '⚠️ Verified role not found.', ephemeral: true });
if (i.member.roles.cache.has(verifiedRole.id))
return i.reply({ content: "You're already verified.", ephemeral: true });
await i.member.roles.add(verifiedRole);
return i.reply({ content: '✅ Verified—welcome to WOCKHARDT!', ephemeral: true });
}
});

/* ---------- LOGIN ---------- */
client.login(process.env.TOKEN);
