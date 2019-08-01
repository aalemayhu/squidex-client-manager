const { SquidexClientManager } = require('squidex-client-manager');
require('dotenv').config();

const main = async () => {
  const clientSecret = process.env.SQUIDEX_CLIENT_SECRET;
  const clientId = process.env.SQUIDEX_CLIENT_ID;
  const url = process.env.SQUIDEX_CONNECT_URL;
  const appName = process.env.APP_NAME;

  const client = new SquidexClientManager(url, appName, clientId, clientSecret);
  // Get our record data
  const record = await client.RecordAsync('Articles', {
    id: '4bb3a7bb-962d-4183-9ca6-35d170c34f3b',
  });

  // Change the relevant fields
  record.title.iv = 'the title is updated';
  record.text.iv = 'the article text updated';

  // Send the update
  const update = await client.UpdateAsync('Articles', {
    id: '4bb3a7bb-962d-4183-9ca6-35d170c34f3b',
    data: record,
  });
  console.log(JSON.stringify(update, null, 2));
};

main();
