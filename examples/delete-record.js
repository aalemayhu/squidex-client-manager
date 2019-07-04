const { SquidexClientManager } = require('squidex-client-manager');
require('dotenv').config();

const main = async () => {
  const clientSecret = process.env.SQUIDEX_CLIENT_SECRET;
  const clientId = process.env.SQUIDEX_CLIENT_ID;
  const url = process.env.SQUIDEX_CONNECT_URL;
  const appName = process.env.APP_NAME;

  const client = new SquidexClientManager(url, appName, clientId, clientSecret);
  const deleted = await client.DeleteAsync('Articles', { id: 'cdbcb9f7-f6f6-4a6a-81d9-0c6f9cf385f8' });
  console.log(JSON.stringify(deleted, null, 2));
};

main();
