const appJson = require("./app.json");

module.exports = {
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    usdaApiKey: process.env.USDA_API_KEY ?? "",
  },
};
