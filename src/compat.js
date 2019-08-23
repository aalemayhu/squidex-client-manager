/**
 * Functions for handling breaking changes
 */

function compatState(payload) {
  if (typeof (payload.publish) !== 'undefined') {
    return { publish: payload.publish };
  }
  return { publish: true };
}

function compatPayload(payload) {
  const mangle = payload;
  delete mangle.publish;
  return { requestBody: mangle.data };
}

module.exports.compatState = compatState;
module.exports.compatPayload = compatPayload;
