const { SquidexClientManager } = require('squidex-client-manager');
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

  const deleted = await client.DeleteAsync('Articles', { id: 'cdbcb9f7-f6f6-4a6a-81d9-0c6f9cf385f8' });
  console.log(JSON.stringify(deleted, null, 2));
};

main();