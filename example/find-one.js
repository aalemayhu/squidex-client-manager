const { SquidexClientManager } = require('../src/index');
require('dotenv').config();

const main = async () => {
  const specUrl = process.env.SQUIDEX_SPEC_URL;
  const url = process.env.SQUIDEX_CONNECT_URL;
  const clientId = process.env.SQUIDEX_CLIENT_ID;
  const clientSecret = process.env.SQUIDEX_CLIENT_SECRET;
  const cacheFile = '/tmp/squidex-my-app-token.json';

  const client = new SquidexClientManager(url, clientId, clientSecret, cacheFile);
  try {
    await client.ConfigureAsync(specUrl);
  } catch (error) {
    console.log('Failed to setup the CMS. Please check token is setup!');
    console.error(error);
    process.exit(1);
  }
  const record = await client.FindOne('Articles', 'title', 'Hello Squidex');
  console.log(JSON.stringify(record, null, 2));
};

main();
