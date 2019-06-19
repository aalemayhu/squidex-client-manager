const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

const { Log } = require('./logger');

/**
 * Save a JSON payload for debugging
 * @param {the filename prefix} prefix
 * @param {the object to encode} payload
 */
module.exports.savePayload = (prefix, payload) => {
  const fileName = `${prefix}-${new Date().getTime()}.json`;
  const outputPath = path.join('/tmp/', fileName);
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
  Log.Debug(`saved failed payload at ${outputPath}`);
};
