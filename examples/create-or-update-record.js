const { SquidexClientManager } = require('squidex-client-manager');
require('dotenv').config();

const main = async () => {
  const clientSecret = process.env.SQUIDEX_CLIENT_SECRET;
  const clientId = process.env.SQUIDEX_CLIENT_ID;
  const url = process.env.SQUIDEX_CONNECT_URL;
  const appName = process.env.APP_NAME;

  const client = new SquidexClientManager(url, appName, clientId, clientSecret);
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
