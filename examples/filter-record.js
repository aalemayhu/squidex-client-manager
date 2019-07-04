const { SquidexClientManager } = require('squidex-client-manager');
require('dotenv').config();

const main = async () => {
  const clientSecret = process.env.SQUIDEX_CLIENT_SECRET;
  const clientId = process.env.SQUIDEX_CLIENT_ID;
  const url = process.env.SQUIDEX_CONNECT_URL;
  const appName = process.env.APP_NAME;

  const client = new SquidexClientManager(url, appName, clientId, clientSecret);
  const input = { data: { title: { iv: 'Hello Squidex' } }, publish: true };
  const filter = await client.FilterRecordsAsync('Articles', input, 'title');
  console.log(JSON.stringify(filter, null, 2));
};

main();
