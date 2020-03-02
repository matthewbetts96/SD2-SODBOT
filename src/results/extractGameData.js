const playerData = require("./fetchPlayerData");
const { getDivision } = require("./getDivision");
const { getGameDuration } = require("./getGameDuration");
const {
  scoreLimit,
  map,
  incomeLevel,
  mode,
  victory
} = require("./resultsConstants");

async function extractGameData({ message, startData, endData }) {
  const data = Object.entries(startData);
  const player1DbData = await playerData.fetchPlayerData(
    data[1][1].PlayerUserId
  );
  const player2DbData = await playerData.fetchPlayerData(
    data[2][1].PlayerUserId
  );

  const player1Name = data[1][1].PlayerName;
  const player2Name = data[2][1].PlayerName;

  let player1DiscordId;
  let player2DiscordId;
  if (player1DbData.length !== 0) {
    player1DiscordId = player1DbData[0].DiscordUID;
  }
  if (player2DbData.length !== 0) {
    player2DiscordId = player2DbData[0].DiscordUID;
  }

  const player1EugId = data[1][1].PlayerUserId;
  const player2EugId = data[2][1].PlayerUserId;
  const player1DeckCode = data[1][1].PlayerDeckContent;
  const player2DeckCode = data[2][1].PlayerDeckContent;
  const player1Division = getDivision(player1DeckCode);
  const player2Division = getDivision(player2DeckCode);
  const player1Level = data[1][1].PlayerLevel;
  const player2Level = data[2][1].PlayerLevel;
  const scoreCap = `${scoreLimit[data[0][1].ScoreLimit]} (${
    data[0][1].ScoreLimit
  })`;
  const gameName = data[0][1].ServerName;
  const timeLimit = getGameDuration(data[0][1].TimeLimit);
  const mapName = map[data[0][1].Map];
  const income = incomeLevel[data[0][1].IncomeRate];
  const duration = getGameDuration(endData.data.Duration);
  const gameMode = mode[data[0][1].VictoryCond];
  const gameVersion = data[0][1].Version;
  const startMoney = data[0][1].InitMoney;

  const { winner, loser, outCome } = await workOutOutcome(
    message,
    endData,
    player1DbData,
    player2DbData,
    player1Name,
    player2Name
  );

  return {
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
    duration,
    gameMode,
    gameVersion,
    startMoney,
    winner,
    loser,
    outCome
  };
}

async function workOutOutcome(
  message,
  endData,
  player1DbData,
  player2DbData,
  player1Name,
  player2Name
) {
  if (!player1DbData.length && !player2DbData.length) {
    message.channel.send(
      "Both players are unknown to the bot, results will not be recorded nor can the outcome be determined."
    );
    return { winner: "", loser: "", outCome: "" };
  }
  if (!player1DbData.length) {
    message.channel.send(
      `${player1Name} is an unknown player to the bot, results will not be recorded nor can the outcome be determined.`
    );
    return { winner: "", loser: "", outCome: "" };
  }
  if (!player2DbData.length) {
    message.channel.send(
      `${player2Name} is an unknown player to the bot, results will not be recorded nor can the outcome be determined.`
    );
    return { winner: "", loser: "", outCome: "" };
  }

  const messageAuthor = await playerData.fetchPlayerData(message.author.id);

  let authorIsP1;
  if (!messageAuthor.length) {
    message.channel.send(
      "Message author is unknown, results will not be recorded nor can the outcome be determined."
    );
    return { winner: "", loser: "", outCome: "" };
  }
  if (player1DbData[0].EugenUID === messageAuthor[0].EugenUID) {
    authorIsP1 = true;
  } else if (player2DbData[0].EugenUID === messageAuthor[0].EugenUID) {
    authorIsP1 = false;
  } else {
    message.channel.send(
      "Message author is not in the replay, results will not be recorded nor can the outcome be determined."
    );
    return { winner: "", loser: "", outCome: "" };
  }

  if (endData.data.Victory === 3) {
    message.channel.send(
      "SODBOT does not currently support draws, please contact an <@84696940742193152> to have your results manually added."
    );
    return { winner: "", loser: "", outCome: "" };
  }

  if (authorIsP1 === undefined) {
    message.channel.send(
      "You should never see this message, something has gone badly wrong."
    );
    return { winner: "", loser: "", outCome: "" };
  }

  if (authorIsP1) {
    if (endData.data.Victory < 3) {
      winner = player2DbData[0];
      loser = player1DbData[0];
    } else {
      winner = player1DbData[0];
      loser = player2DbData[0];
    }
  }

  if (!authorIsP1) {
    if (endData.data.Victory < 3) {
      winner = player1DbData[0];
      loser = player2DbData[0];
    } else {
      winner = player2DbData[0];
      loser = player1DbData[0];
    }
  }

  return {
    winner: winner,
    loser: loser,
    outCome: victory[endData.data.Victory]
  };
}

module.exports = {
  extractGameData
};
