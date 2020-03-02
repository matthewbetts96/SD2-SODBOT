const { alliesDivs, axisDivs } = require("./resultsConstants");

module.exports.getDivision = code => {
  if (!code) {
    return "Unknown division code";
  }
  let base64data = Buffer.from(code, "base64");
  let binaryData = "";
  for (x of base64data.values()) {
    let a = x.toString(2);
    while (a.length < 8) {
      a = "0" + a;
    }
    binaryData = binaryData + a;
  }

  const header = parseInt(binaryData.slice(12, 17), 2);
  const divs = { ...axisDivs, ...alliesDivs };
  return divs[binaryData.slice(17, 17 + header)];
};
