const { sql } = require("../general/common");

module.exports.fetchPlayerData = async playerEugenUID => {
  return await sql(
    `SELECT * FROM players WHERE "${playerEugenUID}" IN(EugenUID, DiscordUID)`
  ).catch(() => {
    console.log("Caught promise error");
  });
};
