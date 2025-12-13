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
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildVoiceStates // added for 24/7 VC
],
partials: [Partials.GuildMember]
});

// SETTINGS
const WELCOME_CHANNEL = "1446420100822335633";
const VERIFY_CHANNEL = "1449275035020689458"; // NEW: verification embed
const IDLE_VC_ID = "1447154877150265466"; // NEW: 24/7 idle VC
const VC_LINK = "https://discord.gg/AV58C6AwT";
const MAIN_CHAT_LINK = "https://discord.com/channels/1446420100151382131/1446428371595821167";

// ROLES
const PURPLE_ROLE = "1448654794259435614";
const RED_ROLE = "1448654699187277875";

// MEDIA
const PURPLE_GIF = "https://cdn.discordapp.com/attachments/1447035798930325574/1448678742225326221/1B071050-EBBC-499A-9766-0B1B8EA76E04.gif";
const RED_GIF = "https://cdn.discordapp.com/attachments/1447035798930325574/1448684013458817117/705C1CE2-E35E-4FC5-9DFC-0F9B05CB1F52.gif";
const VERIFY_IMG = "https://cdn.discordapp.com/attachments/1447035798930325574/1449276801405816995/IMG_4631.png";

// --------------------------------------------------
// 1️⃣ WELCOME EMBED BUILDER (unchanged)
// --------------------------------------------------
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
.setImage(gif)
.setColor(color)
.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
.setTimestamp();
}

// --------------------------------------------------
// 2️⃣ WELCOME BUTTONS (unchanged)
// --------------------------------------------------
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

// --------------------------------------------------
// 3️⃣ VERIFICATION EMBED BUILDER (NEW)
// --------------------------------------------------
function buildVerifyEmbed() {
return new EmbedBuilder()
.setColor(0x8B00FF)
.setTitle('⛧ WOCKHARDT ・ Verification ⛧')
.setDescription(
`**Welcome, sipper.**\n` +
`Tap the lean cup below to verify & unlock the rest of the server.`
)
.setImage(VERIFY_IMG)
.setFooter({ text: 'Verification required • WOCKHARDT' });
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

// --------------------------------------------------
// 4️⃣ 24/7 IDLE VC (NEW)
// --------------------------------------------------
async function joinIdleVC(guild) {
const vc = guild.channels.cache.get(IDLE_VC_ID);
if (!vc || !vc.isVoiceBased()) return;

try {
const connection = await vc.join();
// 1-hour silence track – loop it or use any 24/7 package you prefer
const dispatcher = connection.play('./silence.mp3', { type: 'unknown' });
dispatcher.on('finish', () => joinIdleVC(guild)); // re-loop
} catch (e) {
console.log('⚠️ Could not join 24/7 VC:', e.message);
}
}

// --------------------------------------------------
// 5️⃣ EVENTS
// --------------------------------------------------
client.on("guildMemberAdd", async (member) => {
const roles = [PURPLE_ROLE, RED_ROLE];
const selected = roles[Math.floor(Math.random() * roles.length)];
const gif = selected === PURPLE_ROLE ? PURPLE_GIF : RED_GIF;

await member.roles.add(selected).catch(() => {});

const welcomeCh = member.guild.channels.cache.get(WELCOME_CHANNEL);
if (welcomeCh) {
welcomeCh.send({
embeds: [buildWelcomeEmbed(member, selected, gif)],
components: [buildButtons()]
});
}
});

client.on("ready", async () => {
console.log("WOCKHARDT Welcome Bot is online!");

// --- register slash commands ---
const commands = [
new SlashCommandBuilder()
.setName("testpurple")
.setDescription("Send the purple welcome embed"),
new SlashCommandBuilder()
.setName("testred")
.setDescription("Send the red welcome embed"),
new SlashCommandBuilder()
.setName("sendverify")
.setDescription("Post the verification embed (one-time setup)")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
await rest.put(
Routes.applicationCommands(client.user.id),
{ body: commands }
);
console.log("Commands registered.");

// --- 24/7 VC ---
const guild = client.guilds.cache.first();
if (guild) joinIdleVC(guild);

// --- send verification embed (only once, on boot) ---
const verifyCh = guild.channels.cache.get(VERIFY_CHANNEL);
if (verifyCh) {
// check if last message is already the verify embed to avoid spam
const msgs = await verifyCh.messages.fetch({ limit: 1 });
if (!msgs.size || !msgs.first().components.size) {
await verifyCh.send({
embeds: [buildVerifyEmbed()],
components: [buildVerifyButton()]
});
console.log("✅ Verification embed posted.");
}
}
});

// --------------------------------------------------
// 6️⃣ SLASH COMMAND HANDLER
// --------------------------------------------------
client.on("interactionCreate", async (interaction) => {
if (!interaction.isChatInputCommand()) return;
const member = interaction.member;
const welcomeCh = interaction.guild.channels.cache.get(WELCOME_CHANNEL);

if (interaction.commandName === "testpurple") {
if (!welcomeCh) return interaction.reply({ content: "Welcome channel missing!", ephemeral: true });
await member.roles.add(PURPLE_ROLE).catch(() => {});
welcomeCh.send({ embeds: [buildWelcomeEmbed(member, PURPLE_ROLE, PURPLE_GIF)], components: [buildButtons()] });
return interaction.reply({ content: "Sent!", ephemeral: true });
}

if (interaction.commandName === "testred") {
if (!welcomeCh) return interaction.reply({ content: "Welcome channel missing!", ephemeral: true });
await member.roles.add(RED_ROLE).catch(() => {});
welcomeCh.send({ embeds: [buildWelcomeEmbed(member, RED_ROLE, RED_GIF)], components: [buildButtons()] });
return interaction.reply({ content: "Sent!", ephemeral: true });
}

if (interaction.commandName === "sendverify") {
const verifyCh = interaction.guild.channels.cache.get(VERIFY_CHANNEL);
if (!verifyCh) return interaction.reply({ content: "Verification channel missing!", ephemeral: true });
await verifyCh.send({ embeds: [buildVerifyEmbed()], components: [buildVerifyButton()] });
return interaction.reply({ content: "Verification embed posted!", ephemeral: true });
}
});

// --------------------------------------------------
// 7️⃣ VERIFICATION BUTTON CLICK (NEW)
// --------------------------------------------------
client.on("interactionCreate", async (i) => {
if (!i.isButton()) return;
if (i.customId !== 'verify_btn') return;

const verifiedRole = i.guild.roles.cache.find(r => r.name.toLowerCase() === 'verified');
if (!verifiedRole) return i.reply({ content: "⚠️ Verified role not found.", ephemeral: true });

if (i.member.roles.cache.has(verifiedRole.id))
return i.reply({ content: "You're already verified.", ephemeral: true });

await i.member.roles.add(verifiedRole);
i.reply({ content: "✅ Verified—welcome to WOCKHARDT!", ephemeral: true });
});

client.login(process.env.TOKEN);
