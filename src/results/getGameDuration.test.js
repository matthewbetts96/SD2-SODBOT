const { getGameDuration } = require("./getGameDuration");

describe("getGameDuration", () => {
  it.each([
    ["", "No Limit"],
    [null, "No Limit"],
    [undefined, "No Limit"],
    [0, "No Limit"],
    ["0", "No Limit"],
    ["59", "0 minutes : 59 seconds"],
    ["60", "1 minutes : 0 seconds"],
    ["61", "1 minutes : 1 seconds"],
    ["6000", "100 minutes : 0 seconds"],
    ["12345", "205 minutes : 45 seconds"]
  ])("time %s should return %s", (time, output) => {
    expect(getGameDuration(time)).toEqual(output);
  });
});
