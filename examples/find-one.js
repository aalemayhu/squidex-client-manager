const { SquidexClientManager } = require('../src/index');
require('dotenv').config();

const main = async () => {
  const clientSecret = process.env.SQUIDEX_CLIENT_SECRET;
  const clientId = process.env.SQUIDEX_CLIENT_ID;
  const url = process.env.SQUIDEX_CONNECT_URL;
  const appName = process.env.APP_NAME;

  const client = new SquidexClientManager(url, appName, clientId, clientSecret);
  const record = await client.FindOne('Articles', 'title', 'Hello Squidex');
  console.log(JSON.stringify(record, null, 2));
};

main();
