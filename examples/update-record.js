const { SquidexClientManager } = require('squidex-client-manager');
require('dotenv').config();

const main = async () => {
  const clientSecret = process.env.SQUIDEX_CLIENT_SECRET;
  const clientId = process.env.SQUIDEX_CLIENT_ID;
  const url = process.env.SQUIDEX_CONNECT_URL;
  const appName = process.env.APP_NAME;

  const client = new SquidexClientManager(url, appName, clientId, clientSecret);
  const update = await client.UpdateAsync('Articles', {
    id: '4bb3a7bb-962d-4183-9ca6-35d170c34f3b',
    data: {
      title: { iv: 'the title is updated' },
      text: { iv: 'the article text' },
    },
  });
  console.log(JSON.stringify(update, null, 2));
};

main();
