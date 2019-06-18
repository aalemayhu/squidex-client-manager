// NB: Please note this test script is run serially (.serial)
// This means they are supposed to be run in order, due to the
// Get Models setting up context. It's setup this way for flexibility.
import test from 'ava';
import dotenv from 'dotenv';

import { SquidexClientManager } from '../src/index';

dotenv.config();

const specUrl = process.env.SQUIDEX_SPEC_URL;
const url = process.env.SQUIDEX_CONNECT_URL;
const clientId = process.env.SQUIDEX_CLIENT_ID;
const clientSecret = process.env.SQUIDEX_CLIENT_SECRET;
const cacheFile = '/tmp/squidex-my-app-token.json';

const client = new SquidexClientManager(url, clientId, clientSecret, cacheFile);

function uniqueString(prefix) {
  const dateStamp = new Date().toString();
  return prefix ? `${prefix}-${dateStamp}` : dateStamp;
}

async function simpleWriteCheck(t, modelName, payload) {
  const record = await client.CreateAsync(modelName, payload);
  t.truthy(record.id);

  const records = await client.RecordsAsync(modelName);
  t.true(records.items.length > 0);

  await client.DeleteAsync(modelName, { id: record.id });
}

test.before('Get Models', async (t) => {
  await client.ConfigureAsync(specUrl);
  const models = client.Models();
  t.true(Object.keys(models).length > 0);
});

test.serial('Articles', async (t) => {
  const text = uniqueString('Testo');
  const expected = { data: { title: { iv: text } }, publish: true };
  const article = await client.CreateAsync('Articles', expected);
  t.truthy(article);

  // Make sure we can find the recently created article
  const filter = await client.FilterRecordsAsync('Articles', expected, 'title');
  const created = filter[0];
  t.true(created !== undefined);
  t.true(created.data.title.iv === expected.data.title.iv);

  // Update exiting article and check the changes were made
  const update = await client.UpdateAsync('Articles', {
    id: article.id,
    data: {
      title: { iv: created.data.title.iv },
      text: { iv: 'x' },
    },
  });
  t.true(update.text.iv === 'x');
  t.truthy(article.id);

  // Check update works via create or update call
  const createOrUpdate = await client.CreateOrUpdateAsync('Articles', {
    id: article.id,
    data: {
      title: { iv: update.title.iv },
      text: { iv: 'y' },
    },
  }, 'title');
  t.true(createOrUpdate.text.iv === 'y');

  // Clean up
  const deleteOp = await client.DeleteAsync('Articles', { id: article.id });
  t.true(deleteOp.status === 204);
});

test.serial('Tag', async (t) => {
  await simpleWriteCheck(t, 'Tag', {
    publish: true,
    data: {
      name: { iv: uniqueString('cool') },
    },
  });
});
