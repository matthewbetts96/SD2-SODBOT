const {
  connect,
  allies,
  axis,
  maps1v1,
  maps2v2,
  maps3v3,
  maps4v4
} = require("./general/common");

//Yes this is slow, but whatever :D
module.exports.createTables = async message => {
  await createDivisionTables();
  await createPlayerTable();
  await createMapTable();
  await createBlacklistTable();
};

async function createDivisionTables() {
  const db = connect();
  const divs = { ...allies, ...axis };
  await db.serialize(() => {
    for (div in divs) {
      //create table for current div
      const currentDiv = "Table_" + div.split(" ").join("");
      db.serialize(() => {
        db.run(
          `CREATE TABLE IF NOT EXISTS ${currentDiv}(OpposingDiv text PRIMARY KEY, Wins integer NOT NULL, Losses integer NOT NULL, WinPercent integer NOT NULL, Picks integer NOT NULL)`,
          err => {
            if (err) {
              console.log(err);
            } else {
              console.log(`${currentDiv} created.`);
            }
          }
        );
      });
    }

    for (div in divs) {
      const currentDivisionTable = "Table_" + div.split(" ").join("");
      for (division in divs) {
        db.serialize(() => {
          db.run(
            `INSERT INTO ${currentDivisionTable} VALUES(?,?,?,?,?)`,
            [division, 0, 0, 0, 0],
            err => {
              if (err) {
                console.log(err);
              } else {
                console.log(`Item inserted into ${currentDivisionTable}`);
              }
            }
          );
        });
      }
    }
  });
  db.close();
}

async function createPlayerTable() {
  const db = connect();
  const sqlPlayer =
    "CREATE TABLE IF NOT EXISTS players(DiscordUID text PRIMARY KEY, EugenUID text NOT NULL, Name text NOT NULL, Wins integer NOT NULL, Losses integer NOT NULL, WinPercent integer NOT NULL, Elo integer NOT NULL, WinStreak integer NOT NULL)";

  db.serialize(() => {
    db.run(sqlPlayer, err => {
      if (err) {
        console.log(err);
      } else {
        console.log("'players' table created if it doesn't exist.");
      }
    });
  });
  db.close();
}

async function createMapTable() {
  const db = connect();
  const sqlMaps =
    "CREATE TABLE IF NOT EXISTS mapResults(Name text PRIMARY KEY, Picks integer NOT NULL)";
  const maps = {
    ...maps1v1,
    ...maps2v2,
    ...maps3v3,
    ...maps4v4
  };
  await db.serialize(() => {
    db.run(sqlMaps, err => {
      if (err) {
        console.log("maps:" + err);
      } else {
        console.log("'maps' table created if it doesn't exist.");
      }
    });
    for (map in maps) {
      db.serialize(() => {
        db.run("INSERT INTO mapResults VALUES(?,?)", [map, 0], err => {
          if (err) {
            console.log("mspas" + err);
          }
        });
      });
    }
  });
  db.close();
}

async function createBlacklistTable() {
  const db = connect();
  const blacklistTable =
    "CREATE TABLE IF NOT EXISTS blacklist(blockedUID integer PRIMARY KEY, blockedName text NOT NULL, date text NOT NULL)";
  await db.serialize(() => {
    db.run(blacklistTable, err => {
      if (err) {
        console.log("createBlacklistTable | " + err);
      } else {
        console.log("'blacklistTable' table created if it doesn't exist.");
      }
    });
  });
  db.close();
}
