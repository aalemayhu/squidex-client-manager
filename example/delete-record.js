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

  const deleted = await client.DeleteAsync('Articles', { id: 'cdbcb9f7-f6f6-4a6a-81d9-0c6f9cf385f8' });
  console.log(JSON.stringify(deleted, null, 2));
};

main();
