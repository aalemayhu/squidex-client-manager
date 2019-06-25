const { SquidexClientManager } = require('../src/index.js');
const path = require('path');
require('dotenv').config();

const main = async () => {
  const specUrl = process.env.SQUIDEX_SPEC_URL;
  const url = process.env.SQUIDEX_CONNECT_URL;
  const clientId = process.env.SQUIDEX_CLIENT_ID;
  const clientSecret = process.env.SQUIDEX_CLIENT_SECRET;
  const assetUrl = process.env.SQUIDEX_ASSETS_URL;
  const cacheFile = '/tmp/squidex-my-app-token.json';

  const client = new SquidexClientManager(url, clientId, clientSecret, cacheFile);
  try {
    await client.ConfigureAsync(specUrl);
  } catch (error) {
    console.log('Failed to setup the CMS. Please check token is setup!');
    console.error(error);
    process.exit(1);
  }
  const localImageFile = path.resolve(__dirname, '../GitHub/power-by.png');
  console.log(localImageFile);
  const upload = await client.CreateAssetAsync(assetUrl, localImageFile);
  console.log(JSON.stringify(upload, null, 2));
};

main();
