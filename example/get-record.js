const { SquidexClientManager } = require('../src/index');
require('dotenv').config();

const main = async () => {
  const specUrl = 'https://cloud.squidex.io/api/content/my-blog-squidex/swagger/v1/swagger.json';
  const token = process.env.SQUIDEX_ACCESS_TOKEN;

  const client = new SquidexClientManager(specUrl, token);
  try {
    await client.ConfigureAsync();
  } catch (error) {
    console.log('Failed to setup the CMS. Please check token is setup!');
    console.error(error);
    process.exit(1);
  }
  const records = await client.RecordAsync('Articles', { id: '4bb3a7bb-962d-4183-9ca6-35d170c34f3b' });
  console.log(JSON.stringify(records, null, 2));
};

main();
