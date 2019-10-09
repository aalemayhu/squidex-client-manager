/**
 * Functions for handling breaking changes
 */
function compatState(payload) {
  const data = { publish: true };
  if (typeof (payload.publish) !== 'undefined') {
    data.publish = payload.publish;
  }
  if (typeof (payload.id) !== 'undefined') {
    data.id = payload.id;
  }
  return data;
}

function compatPayload(payload) {
  const mangle = payload;
  let { data } = mangle;

  // Handle payload is not inside of data
  if (!data) {
    data = {};
    const keys = Object.keys(mangle);
    // eslint-disable-next-line no-restricted-syntax
    for (const key of keys) {
      data[`${key}`] = mangle[`${key}`];
    }
  }

  delete mangle.publish;
  delete data.publish;

  return { requestBody: data };
}

module.exports.compatState = compatState;
module.exports.compatPayload = compatPayload;
