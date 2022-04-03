const fetch = require('node-fetch');
const http = require("http");
const express = require("express");
const app = express();
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const noblox = require('noblox.js')
var server = require("http").createServer(app);

noblox.setCookie(process.env.COOKIE).then(function() {
    console.log("Logged in to roblox!")
}).catch(function(err) {
    console.log("Unable to log in to roblox!", err)
})

app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});

const listener = server.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});

setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

const { Client, Intents } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});



// ---------------- Lists ---------------- //

const flipCmdList = [
  "Heads",
  "Tails",
  "Heads",
  "Tails"
];

const flipCmdRandomTextList = [
  "Nice!",
  "Sick!",
  "Neat.",
  "Cool!"
];

// ---------------- Ready Commands n Stuff ---------------- //

client.on("ready", () => {
  
  console.log("The bot is Ready.")
  
  client.user.setActivity('slash commands', { type: 'LISTENING' });
  
  const guildId = "954983446336397332";
  const guild = client.guilds.cache.get(guildId);
  let commands;
  
  if (guild) {
    commands = guild.commands;
  } else{
    commands = client.application.commands;
  };
  
  commands.create({
    name: "ping",
    description: "Outputs latency between message and reply."
  });
  
  const intOption = {type: "INTEGER", name: "time", required: true, description: "How much time until the bot says heads/tails?" }
  
  commands.create({
    name: "flip",
    description: "Flip the coin! Says heads or tails.",
    options: [intOption]
  });
  
  const idIntegerOption = {type: "INTEGER", name: "id", required: true, description: "Place ID." }
  
  commands.create({
    name: "gameinfo",
    description: "Retrieves BloxFestival's visits and more",
    options: [idIntegerOption],
  });
  
  const issStringOption = {type: "STRING", name: "text", required: true, description: "Message to send." }
  const severeStringOption = {type: "INTEGER", name: "severity", required: true, description: "How urgent is it on a scale of 0 to 5?" }
  
  commands.create({
    name: "issue",
    description: "Send an issue to the bot developer",
    options: [issStringOption, severeStringOption]
  });
});

let issueCooldown = false;

// ---------------- Interactions ---------------- //

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	if (interaction.commandName === 'ping') {
		await interaction.reply(`🏓 Pong! **${Date.now() - interaction.createdTimestamp} ms**`);
	};
  
  if (interaction.commandName === 'flip') {
    if (interaction.options.getInteger('time') * 1000 < 1) {
      await interaction.reply({content: "Please input something bigger or equal to 1, this is to prevent API spam\nIf this command was shown to you it now uses seconds, not ticks", ephemeral: true})
    }
		await interaction.reply(":drum: *The coin lands on...* 🥁");
    setTimeout(() => { 
      const randomMessage = flipCmdList[Math.floor(Math.random() * flipCmdList.length)];
      interaction.channel.send("**" + randomMessage +"**! 🎉");
    }, interaction.options.getInteger('time')*1000);
	};
  
  if (interaction.commandName === 'gameinfo') {
    
    // embed
    // 2331361283
    // https://games.roblox.com/v1/games/multiget-place-details?placeIds=6313168515
    
    const inputtedID = interaction.options.getInteger('id').toString();
    const response = await fetch(`https://games.roproxy.com/v1/games/multiget-place-details?placeIds=${inputtedID}`);
    const universeInfo = await response.json();
    console.log(universeInfo);
    
    try {
          const gameInfoEmbed = new MessageEmbed()
	    .setColor('#0099ff')
	    .setTitle(universeInfo[0].name + ' Info')
	    .setURL('https://www.roblox.com/games/6313168515/')
	    .setDescription('Info for ' + universeInfo[0].name)
	    .addFields(
        { name: 'Game Name', value: universeInfo[0].name },
		    { name: 'Visits', value: universeInfo[0].visits.toString() },
        { name: 'Favorites', value: universeInfo[0].favoritedCount.toString() },
        { name: 'Genre', value: universeInfo[0].genre.toString() },
        { name: 'Max players', value: universeInfo[0].maxPlayers.toString() },
        { name: 'Game description', value: universeInfo[0].description },
        { name: 'Created', value: universeInfo[0].updated.toString() },
        { name: 'Last updated', value: universeInfo[0].updated.toString() },
	    )
	    .setTimestamp()
    
    // top text
    
		await interaction.reply({content: "Here's the game info!", embeds: [gameInfoEmbed]});
    } catch (error) {
      await interaction.reply({content: ":x: I've ran into an error whilst doing this job, my proxy might be down, here is the error:\n```diff\n- "+error+"```", ephemeral: true});
      console.error(error)
    }
	};
  
  // issues
  
  if (interaction.commandName === 'issue') {
    const inputtedIssue = interaction.options.getString('text')
    const inputtedSeverity = interaction.options.getInteger('severity')
    
    if (inputtedIssue.includes("http")){
      await interaction.reply({content: "I don't allow you to send videos/links. If your issue has a image then just explain it.\nPlease remove the link and try again", ephemeral: true });
      return;
    }
    
    if (issueCooldown) {
      await interaction.reply({content: "Woah there! Slow down! This command is on cooldown because I prefer not being spammed.", ephemeral: true });
      return;
    }
    
		await interaction.reply({content: "Your issue was sent to the developer.\nRemember, offensive text can result in a ban since your username is recorded", ephemeral: true });
    
    issueCooldown = true;
    
    setTimeout(() => {
      issueCooldown = false;
    }, 10000)
    
    const issueEmbed = new MessageEmbed()
	    .setColor('#0099ff')
	    .setTitle('Issue Summary **                                                        **')
	    .addFields(
		    { name: 'User', value: interaction.user.tag },
        { name: 'User ID', value: interaction.user.id },
        { name: 'Severity', value: inputtedSeverity.toString() },
        { name: 'Content', value: inputtedIssue },
	    )
	    .setTimestamp()
    
    client.users.cache.get("941378834324947036").send({content: "New issue!", embeds: [issueEmbed]})
	};
  
});

client.login(process.env.TOKEN);
