const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

const { Log } = require('./logger');

const CACHE_DIR = '/tmp/squidex-client-manager-cache';

function ensureArgument(arg, name) {
  if (!arg) {
    throw new Error(`missing required argument ${name}`);
  }
}

function encodeValue(value) {
  const safe = crypto.createHash('md5').update(value.toString()).digest('hex');
  return safe;
}

module.exports.cached = (name, fieldName, value) => {
  ensureArgument(name, 'name');
  ensureArgument(fieldName, 'fieldName');
  ensureArgument(value, 'value');

  const dir = path.join(CACHE_DIR, name, fieldName);
  const jsonFileName = `${encodeValue(value)}.json`;
  const entry = path.join(dir, jsonFileName);

  // Ensure the directory for the cache exists
  try {
    fs.ensureDirSync(dir);
  } catch (error) {
    Log.Error(error);
    return undefined;
  }

  // Save the data to the cache
  if (fs.existsSync(entry)) {
    Log.Debug(`using cache ${entry}`);
    try {
      const data = fs.readFileSync(entry);
      return JSON.parse(data);
    } catch (error) {
      Log.Info(`failed to parse cache ${entry}`);
      Log.Error(error);
      return undefined;
    }
  }
  return undefined;
};

module.exports.saveCache = (name, fieldName, value, data) => {
  ensureArgument(name, 'name');
  ensureArgument(fieldName, 'fieldName');
  ensureArgument(value, 'value');
  ensureArgument(data, 'data');

  try {
    const jsonFileName = `${encodeValue(value)}.json`;
    const entry = path.join(CACHE_DIR, name, fieldName, jsonFileName);
    try {
      fs.writeFileSync(entry, JSON.stringify(data, null, 2));
    } catch (error) {
      Log.Info(`failed to read cache data from ${entry}`);
      Log.Error(error);
    }
  } catch (error) {
    Log.Info(`creating hash failed for ${JSON.stringify(data, null, 2)}`);
    Log.Error(error);
  }
};

module.exports.deleteCache = (name, fieldName, value) => {
  const jsonFileName = `${encodeValue(value)}.json`;
  const entry = path.join(CACHE_DIR, name, fieldName, jsonFileName);
  if (fs.existsSync(entry)) {
    fs.unlinkSync(entry);
  }
};


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
