const path = require('path');

const { SquidexClientManager } = require('../src/index.js');
require('dotenv').config();

const main = async () => {
  const clientSecret = process.env.SQUIDEX_CLIENT_SECRET;
  const clientId = process.env.SQUIDEX_CLIENT_ID;
  const url = process.env.SQUIDEX_CONNECT_URL;
  const appName = process.env.APP_NAME;

  const filename = process.argv[2] || '../GitHub/power-by.png';

  const client = new SquidexClientManager(url, appName, clientId, clientSecret);
  const localImageFile = path.resolve(__dirname, filename);
  const upload = await client.CreateAssetAsync(localImageFile);
  console.log(upload.statusText, `${url}/api/assets/${upload.body.id}?version=${upload.body.version}`);
};

main();
