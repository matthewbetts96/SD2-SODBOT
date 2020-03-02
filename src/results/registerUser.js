const common = require("../general/common");

module.exports.registerUser = (message, input) => {
  console.log(input);
  const db = common.connect();
  let discordID = message.author.id;
  let username = message.author.username;
  let eugenUID = input;

  if (isNaN(eugenUID)) {
    message.reply(
      "Unknown form of Eugen ID. Please reuse the `register` command followed by your Eugen ID. You can find out your ID by uploading a replay, the ID will be next to your name."
    );
    return;
  }

  db.all(
    "INSERT INTO players VALUES(?,?,?,?,?,?,?,?)",
    [discordID, eugenUID, username, 0, 0, 0, 1500, 0],
    err => {
      if (err) {
        const errMsg =
          err.message ===
          "SQLITE_CONSTRAINT: UNIQUE constraint failed: players.eugenUID"
            ? "You are already registered."
            : "Error. Please notify an admin.";
        return common.say(message, `*${err.message}*\n${errMsg}`);
      } else {
        common.say(
          message,
          `Database updated. Welcome to the rankings ${username}.`
        );
      }
    }
  );
  db.close();
};
