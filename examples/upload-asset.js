const path = require('path');

// XXX: This does not work yet, please don't try it
const { SquidexClientManager } = require('../src/index.js');
require('dotenv').config();

const main = async () => {
  const clientSecret = process.env.SQUIDEX_CLIENT_SECRET;
  const clientId = process.env.SQUIDEX_CLIENT_ID;
  const url = process.env.SQUIDEX_CONNECT_URL;
  const appName = process.env.APP_NAME;

  const client = new SquidexClientManager(url, appName, clientId, clientSecret);
  const localImageFile = path.resolve(__dirname, '../GitHub/power-by.png');
  console.log(localImageFile);
  const upload = await client.CreateAssetAsync(localImageFile);
  console.log(JSON.stringify(upload, null, 2));
};

main();
