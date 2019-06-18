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
  const createOrUpdate = await client.CreateOrUpdateAsync('Articles', {
    id: '4bb3a7bb-962d-4183-9ca6-35d170c34f3b',
    data: {
      title: { iv: 'title here is used as unique value for comparison' },
      text: { iv: 'y' },
    },
  }, 'title');
  console.log(JSON.stringify(createOrUpdate, null, 2));
};

main();
