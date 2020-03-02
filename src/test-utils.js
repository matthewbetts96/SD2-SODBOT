const _ = require("lodash");

module.exports.message = mockFunction => {
  return {
    reply: i => mockFunction(i),
    channel: {
      send: i => mockFunction(i)
    },
    author: {
      id: 12345
    },
    attachments: {
      first: i => {
        return {
          url: i
        };
      }
    }
  };
};

module.exports.oneOf = (item, obj) => {
  return Object.keys(obj).includes(item);
};

module.exports.mockReplayGame = ({
  map,
  playerName1,
  playerName2,
  victoryCond,
  timeLimit,
  duration,
  victory,
  score
}) => {
  //48 bit header + game data + random stuff + end data
  return (
    "123456789012345678901234567890123456789012345678" +
    JSON.stringify(
      mockStartData({
        map,
        playerName1,
        playerName2,
        victoryCond,
        timeLimit
      })
    ) +
    "somerandombitsofuselessdata" +
    JSON.stringify(mockEndData({ duration, victory, score }))
  );
};

module.exports.mockStartData = mockStartData = ({
  map,
  playerName1,
  playerName2,
  victoryCond,
  timeLimit,
  startMoney,
  player1UserId,
  player2UserId,
  incomeRate,
  serverName
}) => {
  return {
    game: {
      Version: "21421",
      ModList: "",
      GameMode: "1",
      Map: map || "_3x2_Bridges_Smolyany_LD_3v3_BKT",
      NbMaxPlayer: "2",
      NbIA: "0",
      GameType: "0",
      Private: "0",
      ScoreLimit: "1000",
      IALevel: "3",
      VictoryCond: victoryCond || "2",
      AllowObservers: "0",
      Attacker: "0",
      IsNetworkMode: "0",
      Currency: "3",
      Seed: "5591489160341444062",
      UniqueSessionId: "47c5fe0b:4a169d73:62f88198:d58a82b2",
      TimeLimit: timeLimit || "2400",
      InitMoney: startMoney || "750",
      IncomeRate: incomeRate || "0",
      ServerName: serverName || "Mock data game"
    },
    player_0: {
      PlayerUserId: player1UserId || "8642365472345245456",
      PlayerElo: "0",
      PlayerRank: "0",
      PlayerLevel: "1",
      PlayerName: playerName1 || "player name 1",
      PlayerTeamName: "",
      PlayerAvatar: "VirtualData/GamerPicture/76561198032923399",
      PlayerIALevel: "0",
      PlayerReady: "1",
      PlayerDeckContent: "",
      PlayerModList: "",
      PlayerAlliance: "1",
      PlayerIsEnteredInLobby: "1",
      PlayerScoreLimit: "2000",
      PlayerSlot: "1"
    },
    player_1: {
      PlayerUserId: player2UserId || "18446744073709551615",
      PlayerElo: "1500",
      PlayerRank: "0",
      PlayerLevel: "0",
      PlayerName: playerName2 || "player name 2",
      PlayerTeamName: "",
      PlayerAvatar: "",
      PlayerIALevel: "3",
      PlayerReady: "1",
      PlayerDeckContent: "",
      PlayerModList: "",
      PlayerAlliance: "0",
      PlayerIsEnteredInLobby: "1",
      PlayerScoreLimit: "2000",
      PlayerSlot: "0"
    },
    ingamePlayerId: 1
  };
};

module.exports.mockEndData = mockEndData = ({ duration, victory, score }) => {
  return {
    data: {
      Duration: duration || "1554",
      Victory: victory || "4",
      Score: score || "0"
    }
  };
};
