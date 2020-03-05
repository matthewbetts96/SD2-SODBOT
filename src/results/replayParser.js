const Discord = require("discord.js");
const fetch = require("node-fetch");
const fileType = require("file-type");
const { sql, say } = require("../general/common");
const { updateTable } = require("../results/results-main");
const { extractGameData } = require("./extractGameData");

module.exports.replayInfo = async message => {
  const url = message.attachments.first().url;
  fetch(url)
    .then(res => res.buffer())
    .then(async buffer => {
      fileType(buffer);
      content = buffer;
      parse({ message, content });
    });
};

module.exports.parse = parse = async ({ message, content }) => {
  const start = content
    .slice(0x30)
    .toString()
    .split(`,"ingamePlayerId`)[0];
  const startData = JSON.parse(`{"data":${start}}}`);

  const end = content.toString().split(`{"result":`)[1];
  const endData = JSON.parse(`{"data":${end}`);

  const playerCount = Object.keys(startData.data).length - 1;
  if (playerCount !== 2) {
    return;
  }

  const {
    player1Name,
    player2Name,
    player1DiscordId,
    player2DiscordId,
    player1EugId,
    player2EugId,
    player1DeckCode,
    player2DeckCode,
    player1Division,
    player2Division,
    player1Level,
    player2Level,
    scoreCap,
    gameName,
    timeLimit,
    mapName,
    income,
    startMoney,
    duration,
    gameMode,
    gameVersion,
    winner,
    loser,
    outCome
  } = await extractGameData({
    message,
    startData: startData.data,
    endData
  });

  const embed = new Discord.RichEmbed();

  const attachment = new Discord.Attachment(`general/images/${mapName}.jpg`);
  embed.attachFile(attachment);
  embed.setImage(`attachment://${mapName}.jpg`);

  embed.setTitle(gameName ? gameName : "Skirmish Game");

  if (winner) {
    embed.addField("Winner", `||${winner.Name}||`, true);
    embed.addField("Loser", `||${loser.Name}||`, true);
    embed.addField("Victory State", `||${outCome}||`, true);
    embed.addField("Duration", `||${duration}||`, true);
  }

  embed.setColor("#0099ff");
  embed.setFooter(`Game Version: ${gameVersion}`);
  embed.addField("Score Limit", scoreCap, true);
  embed.addField("Time Limit", timeLimit, true);
  embed.addField("Income", income, true);
  embed.addField("Game Mode", gameMode, true);
  embed.addField("Starting Points", startMoney, true);
  embed.addField("Map", mapName, true);
  embed.addField(
    "-------------------------------------------------",
    "------------------------------------------------"
  );

  embed.addField(
    "Player:",
    `${
      player1DiscordId
        ? `${player1Name} (<@${player1DiscordId}>)`
        : player1Name
        ? player1Name
        : "AI Player"
    } (Eugen ID: ${player1EugId})`
  );
  embed.addField("Division", player1Division, true);
  embed.addField("Level", player1Level, true);
  embed.addField("Deck Code", player1DeckCode);
  embed.addField(
    "-------------------------------------------------",
    "------------------------------------------------"
  );
  embed.addField(
    "Player:",
    `${
      player2DiscordId
        ? `${player2Name} (<@${player2DiscordId}>)`
        : player2Name
        ? player2Name
        : "AI Player"
    } (Eugen ID: ${player2EugId})`
  );
  embed.addField("Division", player2Division, true);
  embed.addField("Level", player2Level, true);
  embed.addField("Deck Code", player2DeckCode);

  message.channel.send(embed);
  if (message.channel.name.includes("replays")) {
    if (winner) {
      addToDb(
        player1DiscordId,
        player2DiscordId,
        player1Division,
        player2Division,
        mapName,
        winner,
        loser,
        duration,
        message
      );
    }
  }
};

async function addToDb(
  player1DiscordId,
  player2DiscordId,
  player1Division,
  player2Division,
  mapName,
  winner,
  loser,
  duration,
  message
) {
  const uid = `${player1DiscordId}|${player2DiscordId}|${player1Division}|${player2Division}|${mapName}|${duration}`;
  const isNonDupeReplay = await sql("INSERT INTO pastReplays VALUES(?)", [
    uid
  ]).catch(err => {
    console.log("Duplicate game");
  });

  if (isNonDupeReplay === undefined) {
    say(
      message,
      "Game already submitted, please contact an admin if this is in error."
    );
    return;
  }

  // ---------------------------------------------------------------------------//
  //map
  await sql("UPDATE mapResults SET Picks = Picks + 1 WHERE Name = ?", [
    mapName
  ]).catch(err => {
    console.log("Error in map update", err);
  });
  // ---------------------------------------------------------------------------//
  //player updates
  await sql("UPDATE players SET Wins = Wins + 1 WHERE DiscordUID = ?", [
    winner.DiscordUID
  ]).catch(err => {
    console.log("Error in map update", err);
  });
  await sql("UPDATE players SET Losses = Losses + 1 WHERE DiscordUID = ?", [
    loser.DiscordUID
  ]).catch(err => {
    console.log("Error in map update", err);
  });

  await sql(
    "UPDATE players SET WinStreak = WinStreak + 1 WHERE DiscordUID = ?",
    [winner.DiscordUID]
  ).catch(err => {
    console.log("Error in map update", err);
  });
  await sql("UPDATE players SET WinStreak = 0 WHERE DiscordUID = ?", [
    loser.DiscordUID
  ]).catch(err => {
    console.log("Error in map update", err);
  });

  await sql(
    "UPDATE players SET WinPercent = CAST(Wins AS float)/(CAST(Wins AS float) + CAST(Losses AS float))*100 WHERE DiscordUID = ?",
    [winner.DiscordUID]
  ).catch(err => {
    console.log("Error in win percent update", err);
  });

  await sql(
    "UPDATE players SET WinPercent = CAST(Wins AS float)/(CAST(Wins AS float) + CAST(Losses AS float))*100 WHERE DiscordUID = ?",
    [loser.DiscordUID]
  ).catch(err => {
    console.log("Error in win percent update", err);
  });

  // ---------------------------------------------------------------------------//
  //Division updates
  if (winner.DiscordUID === player1DiscordId) {
    await sql("UPDATE divResults SET Wins = Wins + 1 WHERE Name = ?", [
      player1Division
    ]).catch(err => {
      console.log("Error in map update", err);
    });
    await sql("UPDATE divResults SET Losses = Losses + 1 WHERE Name = ?", [
      player2Division
    ]).catch(err => {
      console.log("Error in map update", err);
    });
  } else {
    await sql("UPDATE divResults SET Wins = Wins + 1 WHERE Name = ?", [
      player2Division
    ]).catch(err => {
      console.log("Error in map update", err);
    });
    await sql("UPDATE divResults SET Losses = Losses + 1 WHERE Name = ?", [
      player1Division
    ]).catch(err => {
      console.log("Error in map update", err);
    });
  }

  await sql(
    "UPDATE divResults SET WinPercent = CAST(Wins AS float)/(CAST(Wins AS float) + CAST(Losses AS float))*100 WHERE Name = ?",
    [player1Division]
  ).catch(err => {
    console.log("player1Division winpercent", err);
  });
  await sql(
    "UPDATE divResults SET WinPercent = CAST(Wins AS float)/(CAST(Wins AS float) + CAST(Losses AS float))*100 WHERE Name = ?",
    [player2Division]
  ).catch(err => {
    console.log("player2Division winpercent", err);
  });

  await sql("UPDATE divResults SET Picks = Wins + Losses WHERE Name = ?", [
    player1Division
  ]).catch(err => {
    console.log("player1Division Picks", err);
  });
  await sql("UPDATE divResults SET Picks = Wins + Losses WHERE Name = ?", [
    player2Division
  ]).catch(err => {
    console.log("player2Division Picks", err);
  });

  const a = player1DiscordId === winner.DiscordUID ? 1 : 0;
  const b = player2DiscordId === winner.DiscordUID ? 1 : 0;
  message.channel.send("Results Submitted.");
  updateTable(message, player1DiscordId, player2DiscordId, a, b);
}
