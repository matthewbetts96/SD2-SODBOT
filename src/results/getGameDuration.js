module.exports.getGameDuration = time => {
  if (!time || time == 0) {
    return "No Limit";
  }
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;
  return `${minutes} minutes : ${seconds} seconds`;
};
