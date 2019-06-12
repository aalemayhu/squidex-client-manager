const { SquidexClientManager } = require('squidex-client-manager');
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
  const input = { data: { title: { iv: 'Hello Squidex' } }, publish: true };
  const filter = await client.FilterRecordsAsync('Articles', input, 'title');
  console.log(JSON.stringify(filter, null, 2));
};

main();
