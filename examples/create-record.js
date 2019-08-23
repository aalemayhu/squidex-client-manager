const { SquidexClientManager } = require('squidex-client-manager');
require('dotenv').config();

const main = async () => {
  const clientSecret = process.env.SQUIDEX_CLIENT_SECRET;
  const clientId = process.env.SQUIDEX_CLIENT_ID;
  const url = process.env.SQUIDEX_CONNECT_URL;
  const appName = process.env.APP_NAME;

  const client = new SquidexClientManager(url, appName, clientId, clientSecret);
  const title = 'My post';
  const body = `
  ## topic 1
  
  Lorem ipsum dolor sit amet, quo ne malis saperet fierent, has ut vivendo
  imperdiet disputando, no cum oratio abhorreant. Agam accusata prodesset cu
  pri, qui iudico constituto constituam an. Ne mel liber libris expetendis, per
  eu imperdiet dignissim. Pro ridens fabulas evertitur ut.
  `;
  const expected = {
    data: {
      title: { iv: title },
      text: { iv: body },
    },
    publish: true,
  };
  const article = await client.CreateAsync('Articles', expected);
  console.log(JSON.stringify(article, null, 2));
};

main();
