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
  const title = 'My post';
  const body = `
  ## topic 1
  
  Lorem ipsum dolor sit amet, quo ne malis saperet fierent, has ut vivendo
  imperdiet disputando, no cum oratio abhorreant. Agam accusata prodesset cu
  pri, qui iudico constituto constituam an. Ne mel liber libris expetendis, per
  eu imperdiet dignissim. Pro ridens fabulas evertitur ut.
  `;
  const expected = { data: { title: { iv: title }, text: { iv: body } }, publish: true };
  const article = await client.CreateAsync('Articles', expected);
  console.log(JSON.stringify(article, null, 2));
};

main();
