const { SquidexClientManager } = require('squidex-client-manager');
require('dotenv').config();

const main = async () => {
  const clientSecret = process.env.SQUIDEX_CLIENT_SECRET;
  const clientId = process.env.SQUIDEX_CLIENT_ID;
  const url = process.env.SQUIDEX_CONNECT_URL;
  const appName = process.env.APP_NAME;

  const client = new SquidexClientManager(url, appName, clientId, clientSecret);
  const records = await client.RecordsAsync('Articles', { top: 0 });
  console.log(JSON.stringify(records, null, 2));

  const allRecords = await client.AllRecordsAsync('Articles');
  console.log(allRecords.length);
};

main();
