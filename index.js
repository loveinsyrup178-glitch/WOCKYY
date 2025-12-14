/*  WOCKHARDT-BOT v2 – Bleed-style, NO economy
    24/7 VC  |  ,wock  |  60+ commands  |  djs v14
*/
require('dotenv').config();
const {
  Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  SlashCommandBuilder, REST, Routes, PermissionsBitField, AttachmentBuilder
} = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource } = require('@discordjs/voice');
const fetch = (...args) => import('node-fetch').then(({default:f})=>f(...args));

/* ---------- CONFIG ---------- */
const WELCOME_CH   = process.env.WELCOME_CH   || '1446420100822335633';
const VERIFY_CH    = process.env.VERIFY_CH    || '1449275035020689458';
const IDLE_VC_ID   = process.env.IDLE_VC_ID   || '1447154877150265466';
const PURPLE_ROLE  = process.env.PURPLE_ROLE  || '1448654794259435614';
const RED_ROLE     = process.env.RED_ROLE     || '1448654699187277875';
const GUILD_ID     = process.env.GUILD_ID;
const TOKEN        = process.env.TOKEN;

/* ---------- CLIENT ---------- */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildInvites
  ],
  partials: [Partials.GuildMember]
});

/* ---------- UTILS ---------- */
const rand = arr => arr[Math.floor(Math.random()*arr.length)];
const SILENCE = createAudioResource('./silence.mp3');

/* ---------- 24/7 VC ---------- */
async function joinIdleVC(guild){
  const vc = guild.channels.cache.get(IDLE_VC_ID);
  if (!vc?.isVoiceBased()) return;
  const conn = joinVoiceChannel({ channelId: vc.id, guildId: guild.id, adapterCreator: guild.voiceAdapterCreator });
  const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play }});
  player.play(SILENCE);
  conn.subscribe(player);
  player.on('idle',()=>player.play(SILENCE));
}

/* ---------- EMBEDS ---------- */
function buildWelcomeEmbed(member,role,gif){
  const color = role===PURPLE_ROLE ? '#8A2BE2':'#B00000';
  return new EmbedBuilder()
    .setTitle('𐌕𐌕・𝐖𝐎𝐂𝐊𝐇𝐀𝐑𝐃𝐓 𝘞𝘌𝘓𝘊𝘖𝘔𝘌 ✦')
    .setDescription(`𝘞𝘦𝘭𝘤𝘰𝘮𝘦 𝘵𝘰 𝘵𝘩𝘦 𝘞𝘰𝘤𝘬 𝘡𝘰𝘯𝘦, ${member}\n\n✦ 𝘴𝘵𝘢𝘺 𝘢𝘤𝘵𝘪𝘷𝘦 \n✦ 𝘪𝘯𝘷 𝟯 𝘧𝘰𝘳 𝘱𝘦𝘳𝘮𝘴 \n✦ 𝘧𝘦𝘦𝘭 𝘢𝘵 𝘩𝘰𝘮𝘦`)
    .setImage(gif).setColor(color).setThumbnail(member.user.displayAvatarURL({dynamic:true})).setTimestamp();
}
function buildVerifyEmbed(){
  return new EmbedBuilder().setColor(0x8b00ff).setTitle('⛧ 𐌕𐌕・𝐖𝐎𝐂𝐊𝐇𝐀𝐑𝐃𝐓 ・ Verification ⛧')
    .setDescription('**Welcome, sipper.**\nTap the lean cup below to verify & unlock the rest of the server.')
    .setImage('https://cdn.discordapp.com/attachments/1447035798930325574/1449276801405816995/IMG_4631.png')
    .setFooter({text:'Verification required • WOCKHARDT'});
}

/* ---------- BUTTONS ---------- */
const rowLinks = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setLabel('CREATE VC').setStyle(ButtonStyle.Link).setURL('https://discord.gg/AV58C6AwT'),
  new ButtonBuilder().setLabel('MAIN CHAT').setStyle(ButtonStyle.Link).setURL('https://discord.com/channels/1446420100151382131/1446428371595821167')
);
const rowVerify = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('verify_btn').setLabel('☆ Verify Me ☆').setEmoji('1376495549179756607').setStyle(ButtonStyle.Secondary)
);

/* ---------- 60+ BLEED COMMANDS ---------- */
const GIFS = ['https://i.imgur.com/3X8MPrv.gif','https://i.imgur.com/F3hE9aR.gif','https://i.imgur.com/uS7NPr0.gif'];
const PICKUPS = ['Are you a double cup? cos I wanna hold you all night','Is your name Wock? cos I’m tryna pour into you'];
const INV = ['You dropped this 👑','You the littest in the chat','Sip approved'];
const EIGHT = ['Pour up','Pause pour','Double cup says yes','Foam cloudy ask later','Too much ice try again','Sip slow – yes','Cut with soda nah','Foam clear definitely','Sticky cup maybe','Codeine vibes only'];

/* ---------- READY ---------- */
client.once('ready', async ()=>{
  console.log(`WOCKHARDT online as ${client.user.tag}`);
  const guild = client.guilds.cache.get(GUILD_ID);
  if (guild) joinIdleVC(guild);
  /* post verify embed once */
  const vch = guild.channels.cache.get(VERIFY_CH);
  if (vch){
    const msgs = await vch.messages.fetch({limit:1});
    if (!msgs.size || !msgs.first().components.size) await vch.send({embeds:[buildVerifyEmbed()],components:[rowVerify]});
  }
});

/* ---------- EVENTS ---------- */
client.on('guildMemberAdd', async m=>{
  const roles = [PURPLE_ROLE, RED_ROLE];
  const pick = roles[Math.floor(Math.random()*roles.length)];
  const gif  = pick===PURPLE_ROLE ? 'https://cdn.discordapp.com/attachments/1447035798930325574/1448678742225326221/1B071050-EBBC-499A-9766-0B1B8EA76E04.gif':'https://cdn.discordapp.com/attachments/1447035798930325574/1448684013458817117/705C1CE2-E35E-4FC5-9DFC-0F9B05CB1F52.gif';
  await m.roles.add(pick).catch(()=>{});
  const ch = m.guild.channels.cache.get(WELCOME_CH);
  if (ch) ch.send({embeds:[buildWelcomeEmbed(m,pick,gif)],components:[rowLinks]});
});

/* ---------- MESSAGE COMMANDS ---------- */
client.on('messageCreate', async m=>{
  if (m.author.bot) return;
  const args = m.content.slice(1).split(' ');
  const cmd  = args.shift()?.toLowerCase();

  /* CORE */
  if (cmd==='wock'){
    const role = m.guild.roles.cache.find(r=>r.name==='wock');
    if (!role) return m.reply('Wock role not found.');
    if (m.member.roles.cache.has(role.id)) return m.reply('You already got the wock 🥤');
    try{
      await m.member.roles.add(role);
      await m.member.setNickname(`⟦𝙬𝙤𝙘𝙠⟧ <:whitelean:1376495549179756607> ${m.user.username}`);
      m.reply(`Wock tag applied 🥤  **${m.member.displayName}**`);
    }catch(e){m.reply(`❌ ${e.message}`);}
    return;
  }

  /* FUN */
  if (cmd==='lean') return m.channel.send({files:[rand(GIFS)]});
  if (cmd==='8cup') return m.reply(`🎱 **${rand(EIGHT)}**`);
  if (cmd==='pickup') return m.reply(rand(PICKUPS));
  if (cmd==='iq') return m.reply(`${m.mentions.members.first()?.user||m.author} IQ is **${Math.floor(Math.random()*200)}**`);
  if (cmd==='ship'){
    const [a,b] = [m.mentions.members.first(),m.mentions.members.last()];
    if (!a||!b) return m.reply('tag two users');
    const score = Math.floor(Math.random()*101);
    return m.reply(`💜 **${a.user.username}** × **${b.user.username}**  ➜  ${score}%`);
  }
  if (cmd==='joke'){
    const j = await fetch('https://official-joke-api.appspot.com/random_joke').then(r=>r.json());
    return m.reply({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(j.setup).setDescription(j.punchline)]});
  }
  if (cmd==='meme'){
    const meme = await fetch('https://meme-api.herokuapp.com/gimme').then(r=>r.json());
    return m.reply({embeds:[new EmbedBuilder().setTitle(meme.title).setImage(meme.url).setColor(0x8b00ff)]});
  }
  if (cmd==='cat') return m.reply({files:[(await fetch('https://api.thecatapi.com/v1/images/search').then(r=>r.json()))[0].url]});
  if (cmd==='dog') return m.reply({files:[(await fetch('https://api.thedogapi.com/v1/images/search').then(r=>r.json()))[0].url]});
  if (cmd==='coinflip') return m.reply(`🪙 **${Math.random()>.5?'Heads':'Tails'}**`);
  if (cmd==='roll'){const n=parseInt(args[0])||6; return m.reply(`🎲 **${Math.floor(Math.random()*n)+1}** (1-${n})`);}
  if (cmd==='random'){
    const role = m.mentions.roles.first();
    if (!role) return m.reply('mention a role');
    const u = role.members.random();
    return m.reply(`Random pick: **${u.user.tag}**`);
  }
  if (cmd==='reverse') return m.reply(args.join(' ').split('').reverse().join(''));
  if (cmd==='mock') return m.reply(args.join(' ').split('').map((c,i)=>i%2?c.toUpperCase():c.toLowerCase()).join(''));
  if (cmd==='emojify'){
    const map = {a:'🇦',b:'🇧',c:'🇨',d:'🇩',e:'🇪',f:'🇫',g:'🇬',h:'🇭',i:'🇮',j:'🇯',k:'🇰',l:'🇱',m:'🇲',n:'🇳',o:'🇴',p:'🇵',q:'🇶',r:'🇷',s:'🇸',t:'🇹',u:'🇺',v:'🇻',w:'🇼',x:'🇽',y:'🇾',z:'🇿'};
    return m.reply(args.join(' ').toLowerCase().split('').map(c=>map[c]||c).join(' '));
  }
  if (cmd==='drank'){const msgs=await m.channel.messages.fetch({limit:2});const last=msgs.last();if(last)return last.react('🥤');}
  if (cmd==='count'){
    const w = m.guild.roles.cache.find(r=>r.name==='wock');
    return m.reply(`🥤 **${w?w.members.size:0}** sippers right now`);
  }
  if (cmd==='leaderboard'){
    const purp = m.guild.roles.cache.get(PURPLE_ROLE).members.map(mm=>mm.user.tag);
    const red  = m.guild.roles.cache.get(RED_ROLE).members.map(mm=>mm.user.tag);
    const txt  = ['**Leaderboard**'].concat(purp.map((u,i)=>`${i+1}. 🟣 ${u}`)).concat(red.map((u,i)=>`${purp.length+i+1}. 🔴 ${u}`));
    return m.channel.send(txt.join('\n').slice(0,2000));
  }
  if (cmd==='wockstats'){
    const g=m.guild;
    const stats = {
      purp:  g.roles.cache.get(PURPLE_ROLE).members.size,
      red:   g.roles.cache.get(RED_ROLE).members.size,
      wock:  g.roles.cache.find(r=>r.name==='wock')?.members.size||0,
      verified: g.roles.cache.find(r=>r.name.toLowerCase()==='verified')?.members.size||0
    };
    m.channel.send({embeds:[{color:0x8b00ff,title:'WOCKHARDT STATS',description:`🟣 Purp: ${stats.purp}\n🔴 Red: ${stats.red}\n🥤 Wock: ${stats.wock}\n✅ Verified: ${stats.verified}`}]});
  }

  /* MODERATION */
  if (cmd==='clear'){
    if (!m.member.permissions.has('ManageMessages')) return m.react('❌');
    const n = Math.min(parseInt(args[0])||1,100);
    await m.channel.bulkDelete(n+1,true);
    m.channel.send(`🧹 ${n} gone`).then(ms=>setTimeout(()=>ms.delete(),3000));
  }
  if (cmd==='say'){
    if (!m.member.permissions.has('ManageMessages')) return m.react('❌');
    const txt = args.join(' ');
    m.channel.send(txt);
    m.delete();
  }
  if (cmd==='embed'){
    if (!m.member.permissions.has('ManageMessages')) return m.react('❌');
    const [title,...desc] = args.join(' ').split('|');
    m.channel.send({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(title).setDescription(desc.join('|'))]});
  }
  if (cmd==='mute'){
    if (!m.member.permissions.has('ModerateMembers')) return m.react('❌');
    const target = m.mentions.members.first();
    if (!target) return m.reply('tag someone');
    const time = ms(args[1])||60000;
    await target.timeout(time);
    m.reply(`${target.user.tag} muted for ${ms(time,{long:true})}`);
  }
  if (cmd==='unmute'){
    if (!m.member.permissions.has('ModerateMembers')) return m.react('❌');
    const target = m.mentions.members.first();
    if (!target) return m.reply('tag someone');
    await target.timeout(null);
    m.reply(`${target.user.tag} unmuted`);
  }
  if (cmd==='slowmode'){
    if (!m.member.permissions.has('ManageChannels')) return m.react('❌');
    const sec = Math.min(parseInt(args[0])||0,21600);
    await m.channel.setRateLimitPerUser(sec);
    m.reply(`Slow-mode set to **${sec} s**`);
  }
  if (cmd==='lock'){
    if (!m.member.permissions.has('ManageChannels')) return m.react('❌');
    await m.channel.permissionOverwrites.edit(m.guild.id,{SendMessages:false});
    m.reply('🔒 Channel locked');
  }
  if (cmd==='unlock'){
    if (!m.member.permissions.has('ManageChannels')) return m.react('❌');
    await m.channel.permissionOverwrites.edit(m.guild.id,{SendMessages:true});
    m.reply('🔓 Channel unlocked');
  }

  /* UTIL */
  if (cmd==='ping') return m.reply(`🏓 **${client.ws.ping} ms**`);
  if (cmd==='serverinfo'){
    const g=m.guild;
    m.reply({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(g.name)
      .addFields(
        {name:'Members',value:g.memberCount.toString(),inline:true},
        {name:'Roles',value:g.roles.cache.size.toString(),inline:true},
        {name:'Boost',value:`Tier ${g.premiumTier}`,inline:true},
        {name:'Created',value:g.createdAt.toDateString(),inline:true}
      ).setThumbnail(g.iconURL({dynamic:true}))]});
  }
  if (cmd==='userinfo'){
    const u = m.mentions.users.first()||m.author;
    const mm = m.guild.members.cache.get(u.id);
    m.reply({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(u.tag)
      .addFields(
        {name:'Joined',value:mm.joinedAt.toDateString(),inline:true},
        {name:'Created',value:u.createdAt.toDateString(),inline:true},
        {name:`Roles [${mm.roles.cache.size-1}]`,value:mm.roles.cache.map(r=>r.toString()).join(' '),inline:false}
      ).setThumbnail(u.displayAvatarURL({dynamic:true}))]});
  }
  if (cmd==='avatar'){
    const u = m.mentions.users.first()||m.author;
    m.reply({files:[u.displayAvatarURL({size:4096,dynamic:true})]});
  }
  if (cmd==='remind'){
    const time = ms(args[0]);
    if (!time) return m.reply('use: ,remind 30m take pizza out');
    const text = args.slice(1).join(' ')||'Reminder';
    setTimeout(()=>m.author.send(`⏰ ${text}`).catch(()=>{}),time);
    m.react('⏰');
  }
  if (cmd==='weather'){
    const city = args.join(' ');
    if (!city) return m.reply('give a city');
    const data = await fetch(`https://api.openweathermap.org/data/2.7/weather?q=${encodeURIComponent(city)}&appid=${process.env.WEATHER}&units=metric`).then(r=>r.json());
    if (data.cod!==200) return m.reply('city not found');
    m.reply({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(`Weather – ${data.name}`)
      .addFields(
        {name:'Temp',value:`${data.main.temp}°C`,inline:true},
        {name:'Feels',value:`${data.main.feels_like}°C`,inline:true},
        {name:'Humidity',value:`${data.main.humidity}%`,inline:true}
      ).setThumbnail(`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`)]});
  }
  if (cmd==='lyrics'){
    const song = args.join(' ');
    if (!song) return m.reply('give song name');
    const data = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(song)}&access_token=${process.env.GENIUS}`).then(r=>r.json());
    const hit = data.response.hits[0];
    if (!hit) return m.reply('not found');
    m.reply({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(hit.result.title).setURL(hit.result.url).setDescription('Full lyrics on Genius').setThumbnail(hit.result.header_image_thumbnail_url)]});
  }
  if (cmd==='translate'){
    const [lang,...text] = args;
    if (!lang||!text.length) return m.reply('use: ,translate en bonjour');
    const data = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.join(' '))}&langpair=${lang}|en`).then(r=>r.json());
    m.reply(data.responseData.translatedText);
  }
  if (cmd==='qr'){
    const txt = args.join(' ');
    if (!txt) return m.reply('give text');
    m.reply({files:[`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(txt)}`]});
  }
  if (cmd==='password'){
    const len = parseInt(args[0])||16;
    const pass = [...Array(len)].map(()=>Math.random().toString(36).slice(-1)).join('');
    m.author.send(`🔑 **${pass}**`);
    m.reply('DM sent');
  }
  if (cmd==='shorten'){
    const url = args[0];
    if (!url) return m.reply('give a url');
    const data = await fetch(`https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(url)}`).then(r=>r.json());
    m.reply(data.result.full_short_link);
  }
  if (cmd==='calc'){
    const expr = args.join(' ');
    try{
      const ans = Function('"use strict";return ('+expr.replace(/[^0-9+\-*/().]/g,'')+')')();
      m.reply(`🧮 ${expr} = **${ans}**`);
    }catch{m.reply('invalid math');}
  }
  if (cmd==='binary'){
    const txt = args.join(' ');
    m.reply(txt.split('').map(c=>c.charCodeAt(0).toString(2)).join(' '));
  }
  if (cmd==='afk'){
    const reason = args.join(' ')||'AFK';
    client.afk.set(m.author.id,reason);
    m.reply(`I set you AFK: ${reason}`);
  }
  if (cmd==='snipe'){
    const msg = client.snipe.get(m.channel.id);
    if (!msg) return m.reply('nothing to snipe');
    m.channel.send({embeds:[new EmbedBuilder().setColor(0x8b00ff).setAuthor({name:msg.author.tag,iconURL:msg.author.displayAvatarURL()}).setDescription(msg.content).setTimestamp(msg.createdAt)]});
  }
  if (cmd==='editsnipe'){
    const msg = client.editSnipe.get(m.channel.id);
    if (!msg) return m.reply('nothing to editsnipe');
    m.channel.send({embeds:[new EmbedBuilder().setColor(0x8b00ff).setAuthor({name:msg.author.tag,iconURL:msg.author.displayAvatarURL()}).addFields({name:'Before',value:msg.old},{name:'After',value:msg.new}).setTimestamp(msg.createdAt)]});
  }
  if (cmd==='poll'){
    const [question,...opts] = args.join(' ').split('|');
    if (!question||opts.length<2) return m.reply('use: ,poll best lean?|purp|red');
    const emos = ['🇦','🇧','🇨','🇩','🇪','🇫'];
    const desc = opts.map((o,i)=>`${emos[i]} ${o}`).join('\n');
    const msg = await m.channel.send({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(question).setDescription(desc)]});
    for (let i=0;i<opts.length;i++) await msg.react(emos[i]);
  }
  if (cmd==='insta'){
    const user = args[0];
    if (!user) return m.reply('give username');
    const data = await fetch(`https://instagram.com/${user}/?__a=1&__d=dis`).then(r=>r.json()).catch(()=>{});
    if (!data?.graphql) return m.reply('user not found');
    const u = data.graphql.user;
    m.reply({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(u.full_name).setURL(`https://instagram.com/${user}`).setImage(u.profile_pic_url_hd).addFields({name:'Posts',value:u.edge_owner_to_timeline_media.count.toString(),inline:true},{name:'Followers',value:u.edge_followed_by.count.toString(),inline:true})]});
  }
  if (cmd==='minecraft'){
    const ip = args[0];
    if (!ip) return m.reply('give server ip');
    const data = await fetch(`https://api.mcsrvstat.us/2/${ip}`).then(r=>r.json());
    if (!data.online) return m.reply('server offline');
    m.reply({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(ip).addFields({name:'Players',value:`${data.players.online}/${data.players.max}`,inline:true},{name:'Version',value:data.version,inline:true})]});
  }
  if (cmd==='emoji'){
    const emo = m.content.split(' ').slice(1).find(e=>e.startsWith('<'));
    if (!emo) return m.reply('send an emoji');
    const match = emo.match(/<(a)?:(\w+):(\d+)>/);
    if (!match) return m.reply('invalid emoji');
    const url = `https://cdn.discordapp.com/emojis/${match[3]}${match[1]?'.gif':'.png'}?size=4096`;
    m.reply({files:[url]});
  }
  if (cmd==='servericon'){
    m.reply({files:[m.guild.iconURL({size:4096,dynamic:true})]});
  }
  if (cmd==='channelinfo'){
    const c = m.channel;
    m.reply({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(c.name).addFields({name:'ID',value:c.id,inline:true},{name:'Type',value:c.type.toString(),inline:true},{name:'Created',value:c.createdAt.toDateString(),inline:true})]});
  }
  if (cmd==='doublecup'){
    const vc = await m.guild.channels.create({name:'Double-Cup Lounge',type:2,userLimit:5});
    const inv = await vc.createInvite({maxAge:300});
    m.reply(`🥤 ${inv.url}`);
  }
  if (cmd==='randomvc'){
    if (!m.member.voice.channel) return m.reply('join a vc first');
    const vcs = m.guild.channels.cache.filter(c=>c.type===2 && c.joinable);
    const rand = vcs.random();
    if (rand) await m.member.voice.setChannel(rand);
    m.reply(`teleported → **${rand.name}**`);
  }
  if (cmd==='gif'){
    const q = args.join(' ')||'lean';
    const key = process.env.TENOR_KEY;
    const data = await fetch(`https://g.tenor.com/v1/search?q=${encodeURIComponent(q)}&key=${key}&limit=1`).then(r=>r.json());
    if (!data.results?.[0]) return m.reply('no gif');
    m.reply(data.results[0].url);
  }
  if (cmd==='clyde'){
    const txt = args.join(' ')||'hello';
    m.reply({files:[`https://ctk-api.herokuapp.com/clyde/${encodeURIComponent(txt)}`]});
  }
  if (cmd==='ascii'){
    const txt = args.join(' ')||'WOCK';
    const data = await fetch(`https://artii.herokuapp.com/make?text=${encodeURIComponent(txt)}`).then(r=>r.text());
    m.reply('```'+data+'```');
  }
  if (cmd==='tinyurl'){
    const url = args[0];
    if (!url) return m.reply('give url');
    const data = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`).then(r=>r.text());
    m.reply(data);
  }
  if (cmd==='color'){
    const hex = args[0];
    if (!/^#[0-9A-F]{6}$/i.test(hex)) return m.reply('invalid hex');
    m.reply({files:[`https://dummyimage.com/300x300/${hex.slice(1)}/fff.png&text=%20`], embeds:[new EmbedBuilder().setColor(hex).setTitle(hex.toUpperCase()).setImage(`https://dummyimage.com/300x300/${hex.slice(1)}/fff.png&text=%20`)]});
  }
  if (cmd==='fact') return m.reply(rand(await fetch('https://uselessfacts.jsph.pl/random.json?language=en').then(r=>r.json()).then(d=>d.text)));
  if (cmd==='quote') return m.reply(rand(await fetch('https://type.fit/api/quotes').then(r=>r.json())).text);
  if (cmd==='insult') return m.reply(`${m.mentions.users.first()||m.author} ${rand(await fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json').then(r=>r.json()).then(d=>d.insult))}`);
  if (cmd==='compliment') return m.reply(`${m.mentions.users.first()||m.author} ${rand(['looks fire today','has elite cup-holding skills','is the main character','smells like lavender lean'])}`);
  if (cmd==='dadjoke') return m.reply(rand(await fetch('https://icanhazdadjoke.com/').then(r=>r.json()).then(d=>d.joke)));
  if (cmd==='kill'){
    const target = m.mentions.members.first()||m.member;
    m.reply(`${target} died **${rand(['from a foam overdose','spilling the double cup','drowning in the syrup'])}** 💀`);
  }
  if (cmd==='slap'){
    const target = m.mentions.members.first();
    if (!target) return m.reply('tag someone');
    m.reply(`${m.member} slaps ${target} with a **sticky cup** 🥤`);
  }
  if (cmd==='hug'){
    const target = m.mentions.members.first()||m.member;
    m.reply(`${m.member} hugs ${target} with **purple arms** 💜`);
  }
  if (cmd==='pat'){
    const target = m.mentions.members.first()||m.member;
    m.reply(`${m.member} pats ${target} on the **double-cup head** 👑`);
  }
  if (cmd==='spank'){
    const target = m.mentions.members.first();
    if (!target) return m.reply('tag someone');
    m.reply(`${m.member} spanks ${target} with **foam overflow** 🍑🥤`);
  }
  if (cmd==='cuddle'){
    const target = m.mentions.members.first()||m.member;
    m.reply(`${m.member} cuddles ${target} under **purple waves** 🌊`);
  }
  if (cmd==='feed'){
    const target = m.mentions.members.first()||m.member;
    m.reply(`${m.member} feeds ${target} **a drop of wock** 💧`);
  }
  if (cmd==='sipp'){
    const target = m.mentions.members.first()||m.member;
    const role = await m.guild.roles.create({name:'SIPPING',color:'#b19cd9'}).catch(()=>{});
    if (role) await target.roles.add(role);
    m.channel.send(`${target} is sipping 🥤`);
    setTimeout(()=>target.roles.remove(role).catch(()=>{}),60000);
  }
  if (cmd==='timer'){
    const time = ms(args[0]);
    if (!time) return m.reply('use: ,timer 30m pizza');
    const text = args.slice(1).join(' ')||'Timer done';
    setTimeout(()=>m.author.send(`⏰ ${text}`).catch(()=>{}),time);
    m.react('⏰');
  }
  if (cmd==='afk'){
    const reason = args.join(' ')||'AFK';
    client.afk.set(m.author.id,reason);
    m.reply(`I set you AFK: ${reason}`);
  }
  if (cmd==='snipe'){
    const msg = client.snipe.get(m.channel.id);
    if (!msg) return m.reply('nothing to snipe');
    m.channel.send({embeds:[new EmbedBuilder().setColor(0x8b00ff).setAuthor({name:msg.author.tag,iconURL:msg.author.displayAvatarURL()}).setDescription(msg.content).setTimestamp(msg.createdAt)]});
  }
  if (cmd==='editsnipe'){
    const msg = client.editSnipe.get(m.channel.id);
    if (!msg) return m.reply('nothing to editsnipe');
    m.channel.send({embeds:[new EmbedBuilder().setColor(0x8b00ff).setAuthor({name:msg.author.tag,iconURL:msg.author.displayAvatarURL()}).addFields({name:'Before',value:msg.old},{name:'After',value:msg.new}).setTimestamp(msg.createdAt)]});
  }
  if (cmd==='poll'){
    const [question,...opts] = args.join(' ').split('|');
    if (!question||opts.length<2) return m.reply('use: ,poll best lean?|purp|red');
    const emos = ['🇦','🇧','🇨','🇩','🇪','🇫'];
    const desc = opts.map((o,i)=>`${emos[i]} ${o}`).join('\n');
    const msg = await m.channel.send({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(question).setDescription(desc)]});
    for (let i=0;i<opts.length;i++) await msg.react(emos[i]);
  }
  if (cmd==='remind'){
    const time = ms(args[0]);
    if (!time) return m.reply('use: ,remind 30m pizza');
    const text = args.slice(1).join(' ')||'Reminder';
    setTimeout(()=>m.author.send(`⏰ ${text}`).catch(()=>{}),time);
    m.react('⏰');
  }
  if (cmd==='weather'){
    const city = args.join(' ');
    if (!city) return m.reply('give a city');
    const data = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.WEATHER}&units=metric`).then(r=>r.json());
    if (data.cod!==200) return m.reply('city not found');
    m.reply({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(`Weather – ${data.name}`).addFields({name:'Temp',value:`${data.main.temp}°C`,inline:true},{name:'Feels',value:`${data.main.feels_like}°C`,inline:true},{name:'Humidity',value:`${data.main.humidity}%`,inline:true}).setThumbnail(`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`)]});
  }
  if (cmd==='lyrics'){
    const song = args.join(' ');
    if (!song) return m.reply('give song name');
    const data = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(song)}&access_token=${process.env.GENIUS}`).then(r=>r.json());
    const hit = data.response.hits[0];
    if (!hit) return m.reply('not found');
    m.reply({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(hit.result.title).setURL(hit.result.url).setDescription('Full lyrics on Genius').setThumbnail(hit.result.header_image_thumbnail_url)]});
  }
  if (cmd==='translate'){
    const [lang,...text] = args;
    if (!lang||!text.length) return m.reply('use: ,translate en bonjour');
    const data = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.join(' '))}&langpair=${lang}|en`).then(r=>r.json());
    m.reply(data.responseData.translatedText);
  }
  if (cmd==='qr'){
    const txt = args.join(' ');
    if (!txt) return m.reply('give text');
    m.reply({files:[`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(txt)}`]});
  }
  if (cmd==='password'){
    const len = parseInt(args[0])||16;
    const pass = [...Array(len)].map(()=>Math.random().toString(36).slice(-1)).join('');
    m.author.send(`🔑 **${pass}**`);
    m.reply('DM sent');
  }
  if (cmd==='shorten'){
    const url = args[0];
    if (!url) return m.reply('give a url');
    const data = await fetch(`https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(url)}`).then(r=>r.json());
    m.reply(data.result.full_short_link);
  }
  if (cmd==='calc'){
    const expr = args.join(' ');
    try{
      const ans = Function('"use strict";return ('+expr.replace(/[^0-9+\-*/().]/g,'')+')')();
      m.reply(`🧮 ${expr} = **${ans}**`);
    }catch{m.reply('invalid math');}
  }
  if (cmd==='binary'){
    const txt = args.join(' ');
    m.reply(txt.split('').map(c=>c.charCodeAt(0).toString(2)).join(' '));
  }
  if (cmd==='color'){
    const hex = args[0];
    if (!/^#[0-9A-F]{6}$/i.test(hex)) return m.reply('invalid hex');
    m.reply({files:[`https://dummyimage.com/300x300/${hex.slice(1)}/fff.png&text=%20`], embeds:[new EmbedBuilder().setColor(hex).setTitle(hex.toUpperCase()).setImage(`https://dummyimage.com/300x300/${hex.slice(1)}/fff.png&text=%20`)]});
  }
  if (cmd==='ascii'){
    const txt = args.join(' ')||'WOCK';
    const data = await fetch(`https://artii.herokuapp.com/make?text=${encodeURIComponent(txt)}`).then(r=>r.text());
    m.reply('```'+data+'```');
  }
  if (cmd==='tinyurl'){
    const url = args[0];
    if (!url) return m.reply('give url');
    const data = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`).then(r=>r.text());
    m.reply(data);
  }
  if (cmd==='insta'){
    const user = args[0];
    if (!user) return m.reply('give username');
    const data = await fetch(`https://instagram.com/${user}/?__a=1&__d=dis`).then(r=>r.json()).catch(()=>{});
    if (!data?.graphql) return m.reply('user not found');
    const u = data.graphql.user;
    m.reply({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(u.full_name).setURL(`https://instagram.com/${user}`).setImage(u.profile_pic_url_hd).addFields({name:'Posts',value:u.edge_owner_to_timeline_media.count.toString(),inline:true},{name:'Followers',value:u.edge_followed_by.count.toString(),inline:true})]});
  }
  if (cmd==='minecraft'){
    const ip = args[0];
    if (!ip) return m.reply('give server ip');
    const data = await fetch(`https://api.mcsrvstat.us/2/${ip}`).then(r=>r.json());
    if (!data.online) return m.reply('server offline');
    m.reply({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(ip).addFields({name:'Players',value:`${data.players.online}/${data.players.max}`,inline:true},{name:'Version',value:data.version,inline:true})]});
  }
  if (cmd==='emoji'){
    const emo = m.content.split(' ').slice(1).find(e=>e.startsWith('<'));
    if (!emo) return m.reply('send an emoji');
    const match = emo.match(/<(a)?:(\w+):(\d+)>/);
    if (!match) return m.reply('invalid emoji');
    const url = `https://cdn.discordapp.com/emojis/${match[3]}${match[1]?'.gif':'.png'}?size=4096`;
    m.reply({files:[url]});
  }
  if (cmd==='servericon'){
    m.reply({files:[m.guild.iconURL({size:4096,dynamic:true})]});
  }
  if (cmd==='channelinfo'){
    const c = m.channel;
    m.reply({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(c.name).addFields({name:'ID',value:c.id,inline:true},{name:'Type',value:c.type.toString(),inline:true},{name:'Created',value:c.createdAt.toDateString(),inline:true})]});
  }
  if (cmd==='doublecup'){
    const vc = await m.guild.channels.create({name:'Double-Cup Lounge',type:2,userLimit:5});
    const inv = await vc.createInvite({maxAge:300});
    m.reply(`🥤 ${inv.url}`);
  }
  if (cmd==='randomvc'){
    if (!m.member.voice.channel) return m.reply('join a vc first');
    const vcs = m.guild.channels.cache.filter(c=>c.type===2 && c.joinable);
    const rand = vcs.random();
    if (rand) await m.member.voice.setChannel(rand);
    m.reply(`teleported → **${rand.name}**`);
  }
  if (cmd==='gif'){
    const q = args.join(' ')||'lean';
    const key = process.env.TENOR_KEY;
    const data = await fetch(`https://g.tenor.com/v1/search?q=${encodeURIComponent(q)}&key=${key}&limit=1`).then(r=>r.json());
    if (!data.results?.[0]) return m.reply('no gif');
    m.reply(data.results[0].url);
  }
  if (cmd==='clyde'){
    const txt = args.join(' ')||'hello';
    m.reply({files:[`https://ctk-api.herokuapp.com/clyde/${encodeURIComponent(txt)}`]});
  }
  if (cmd==='ascii'){
    const txt = args.join(' ')||'WOCK';
    const data = await fetch(`https://artii.herokuapp.com/make?text=${encodeURIComponent(txt)}`).then(r=>r.text());
    m.reply('```'+data+'```');
  }
  if (cmd==='tinyurl'){
    const url = args[0];
    if (!url) return m.reply('give url');
    const data = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`).then(r=>r.text());
    m.reply(data);
  }
  if (cmd==='invite'){
    const inv = await m.channel.createInvite({maxAge:0});
    m.reply(`https://discord.gg/${inv.code}`);
  }
  if (cmd==='afk'){
    const reason = args.join(' ')||'AFK';
    client.afk.set(m.author.id,reason);
    m.reply(`I set you AFK: ${reason}`);
  }
  if (cmd==='snipe'){
    const msg = client.snipe.get(m.channel.id);
    if (!msg) return m.reply('nothing to snipe');
    m.channel.send({embeds:[new EmbedBuilder().setColor(0x8b00ff).setAuthor({name:msg.author.tag,iconURL:msg.author.displayAvatarURL()}).setDescription(msg.content).setTimestamp(msg.createdAt)]});
  }
  if (cmd==='editsnipe'){
    const msg = client.editSnipe.get(m.channel.id);
    if (!msg) return m.reply('nothing to editsnipe');
    m.channel.send({embeds:[new EmbedBuilder().setColor(0x8b00ff).setAuthor({name:msg.author.tag,iconURL:msg.author.displayAvatarURL()}).addFields({name:'Before',value:msg.old},{name:'After',value:msg.new}).setTimestamp(msg.createdAt)]});
  }
  if (cmd==='poll'){
    const [question,...opts] = args.join(' ').split('|');
    if (!question||opts.length<2) return m.reply('use: ,poll best lean?|purp|red');
    const emos = ['🇦','🇧','🇨','🇩','🇪','🇫'];
    const desc = opts.map((o,i)=>`${emos[i]} ${o}`).join('\n');
    const msg = await m.channel.send({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(question).setDescription(desc)]});
    for (let i=0;i<opts.length;i++) await msg.react(emos[i]);
  }
  if (cmd==='remind'){
    const time = ms(args[0]);
    if (!time) return m.reply('use: ,remind 30m pizza');
    const text = args.slice(1).join(' ')||'Reminder';
    setTimeout(()=>m.author.send(`⏰ ${text}`).catch(()=>{}),time);
    m.react('⏰');
  }
  if (cmd==='weather'){
    const city = args.join(' ');
    if (!city) return m.reply('give a city');
    const data = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.WEATHER}&units=metric`).then(r=>r.json());
    if (data.cod!==200) return m.reply('city not found');
    m.reply({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(`Weather – ${data.name}`).addFields({name:'Temp',value:`${data.main.temp}°C`,inline:true},{name:'Feels',value:`${data.main.feels_like}°C`,inline:true},{name:'Humidity',value:`${data.main.humidity}%`,inline:true}).setThumbnail(`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`)]});
  }
  if (cmd==='lyrics'){
    const song = args.join(' ');
    if (!song) return m.reply('give song name');
    const data = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(song)}&access_token=${process.env.GENIUS}`).then(r=>r.json());
    const hit = data.response.hits[0];
    if (!hit) return m.reply('not found');
    m.reply({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle(hit.result.title).setURL(hit.result.url).setDescription('Full lyrics on Genius').setThumbnail(hit.result.header_image_thumbnail_url)]});
  }
  if (cmd==='translate'){
    const [lang,...text] = args;
    if (!lang||!text.length) return m.reply('use: ,translate en bonjour');
    const data = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.join(' '))}&langpair=${lang}|en`).then(r=>r.json());
    m.reply(data.responseData.translatedText);
  }
  if (cmd==='qr'){
    const txt = args.join(' ');
    if (!txt) return m.reply('give text');
    m.reply({files:[`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(txt)}`]});
  }
  if (cmd==='password'){
    const len = parseInt(args[0])||16;
    const pass = [...Array(len)].map(()=>Math.random().toString(36).slice(-1)).join('');
    m.author.send(`🔑 **${pass}**`);
    m.reply('DM sent');
  }
  if (cmd==='shorten'){
    const url = args[0];
    if (!url) return m.reply('give a url');
    const data = await fetch(`https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(url)}`).then(r=>r.json());
    m.reply(data.result.full_short_link);
  }
  if (cmd==='calc'){
    const expr = args.join(' ');
    try{
      const ans = Function('"use strict";return ('+expr.replace(/[^0-9+\-*/().]/g,'')+')')();
      m.reply(`🧮 ${expr} = **${ans}**`);
    }catch{m.reply('invalid math');}
  }
  if (cmd==='binary'){
    const txt = args.join(' ');
    m.reply(txt.split('').map(c=>c.charCodeAt(0).toString(2)).join(' '));
  }
  if (cmd==='color'){
    const hex = args[0];
    if (!/^#[0-9A-F]{6}$/i.test(hex)) return m.reply('invalid hex');
    m.reply({files:[`https://dummyimage.com/300x300/${hex.slice(1)}/fff.png&text=%20`], embeds:[new EmbedBuilder().setColor(hex).setTitle(hex.toUpperCase()).setImage(`https://dummyimage.com/300x300/${hex.slice(1)}/fff.png&text=%20`)]});
  }
  if (cmd==='fact') return m.reply(rand(await fetch('https://uselessfacts.jsph.pl/random.json?language=en').then(r=>r.json()).then(d=>d.text)));
  if (cmd==='quote') return m.reply(rand(await fetch('https://type.fit/api/quotes').then(r=>r.json())).text);
  if (cmd==='insult') return m.reply(`${m.mentions.users.first()||m.author} ${rand(await fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json').then(r=>r.json()).then(d=>d.insult))}`);
  if (cmd==='compliment') return m.reply(`${m.mentions.users.first()||m.author} ${rand(['looks fire today','has elite cup-holding skills','is the main character','smells like lavender lean'])}`);
  if (cmd==='dadjoke') return m.reply(rand(await fetch('https://icanhazdadjoke.com/').then(r=>r.json()).then(d=>d.joke)));
  if (cmd==='kill'){
    const target = m.mentions.members.first()||m.member;
    m.reply(`${target} died **${rand(['from a foam overdose','spilling the double cup','drowning in the syrup'])}** 💀`);
  }
  if (cmd==='slap'){
    const target = m.mentions.members.first();
    if (!target) return m.reply('tag someone');
    m.reply(`${m.member} slaps ${target} with a **sticky cup** 🥤`);
  }
  if (cmd==='hug'){
    const target = m.mentions.members.first()||m.member;
    m.reply(`${m.member} hugs ${target} with **purple arms** 💜`);
  }
  if (cmd==='pat'){
    const target = m.mentions.members.first()||m.member;
    m.reply(`${m.member} pats ${target} on the **double-cup head** 👑`);
  }
  if (cmd==='spank'){
    const target = m.mentions.members.first();
    if (!target) return m.reply('tag someone');
    m.reply(`${m.member} spanks ${target} with **foam overflow** 🍑🥤`);
  }
  if (cmd==='cuddle'){
    const target = m.mentions.members.first()||m.member;
    m.reply(`${m.member} cuddles ${target} under **purple waves** 🌊`);
  }
  if (cmd==='feed'){
    const target = m.mentions.members.first()||m.member;
    m.reply(`${m.member} feeds ${target} **a drop of wock** 💧`);
  }
  if (cmd==='sipp'){
    const target = m.mentions.members.first()||m.member;
    const role = await m.guild.roles.create({name:'SIPPING',color:'#b19cd9'}).catch(()=>{});
    if (role) await target.roles.add(role);
    m.channel.send(`${target} is sipping 🥤`);
    setTimeout(()=>target.roles.remove(role).catch(()=>{}),60000);
  }
  if (cmd==='timer'){
    const time = ms(args[0]);
    if (!time) return m.reply('use: ,timer 30m pizza');
    const text = args.slice(1).join(' ')||'Timer done';
    setTimeout(()=>m.author.send(`⏰ ${text}`).catch(()=>{}),time);
    m.react('⏰');
  }
  if (cmd==='invite'){
    const inv = await m.channel.createInvite({maxAge:0});
    m.reply(`https://discord.gg/${inv.code}`);
  }
  if (cmd==='help'){
    m.reply({embeds:[new EmbedBuilder().setColor(0x8b00ff).setTitle('WOCKHARDT COMMANDS')
      .setDescription(`**Core:** ,wock ,verify ,count ,leaderboard ,stats
**Fun:** ,lean ,8cup ,pickup ,iq ,ship ,joke ,meme ,cat ,dog ,coinflip ,roll ,random ,reverse ,mock ,emojify ,drank ,gif ,clyde ,ascii ,tinyurl ,fact ,quote ,insult ,compliment ,dadjoke ,kill ,slap ,hug ,pat ,spank ,cuddle ,feed ,sipp ,timer ,invite ,afk ,snipe ,editsnipe ,poll ,weather ,lyrics ,translate ,qr ,password ,shorten ,calc ,binary ,color ,insta ,minecraft ,emoji ,servericon ,channelinfo ,doublecup ,randomvc
**Mod:** ,clear ,say ,embed ,mute ,unmute ,slowmode ,lock ,unlock
**Voice:** 24/7 idle VC (no music cmds yet – add Lavalink later)`]});
  }
});

/* ---------- INTERACTIONS ---------- */
client.on('interactionCreate', async i=>{
  if (!i.isButton() || i.customId!=='verify_btn') return;
  const role = i.guild.roles.cache.find(r=>r.name.toLowerCase()==='verified');
  if (!role) return i.reply({content:'⚠️ Verified role not found.', ephemeral:true});
  if (i.member.roles.cache.has(role.id)) return i.reply({content:"You're already verified.", ephemeral:true});
  await i.member.roles.add(role);
  i.reply({content:'✅ Verified—welcome to WOCKHARDT!', ephemeral:true});
});

/* ---------- SNIPE CACHE ---------- */
client.snipe = new Map(); client.editSnipe = new Map(); client.afk = new Map();
client.on('messageDelete', msg=>{if(msg.author.bot)return;client.snipe.set(msg.channel.id,{author:msg.author,content:msg.content,createdAt:msg.createdAt})});
client.on('messageUpdate', (old,msg)=>{if(msg.author.bot)return;client.editSnipe.set(msg.channel.id,{author:msg.author,old:old.content,new:msg.content,createdAt:msg.createdAt})});

/* ---------- LOGIN ---------- */
client.login(TOKEN);
