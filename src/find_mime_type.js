const { execSync } = require('child_process');
const fs = require('fs');

const BufferType = require('buffer-type');
const MimeType = require('mime-types');

const { Log } = require('./logger');

function useBuffer(filePath) {
  const info = BufferType(fs.readFileSync(filePath));
  if (info && info.type) {
    return info.type;
  }
  return null;
}

/**
 * Use BSD file command to get mime type
 * @param {string} filePath - local file path
 */
function useOSFile(filePath) {
  const fileInfo = execSync(`/usr/bin/file --mime-type '${filePath}'`).toString();
  const comps = fileInfo.split(' ');
  return comps[comps.length - 1].trim().replace('\n');
}

function findMimeType(filePath) {
  let mimeType = MimeType.lookup(filePath);
  if (mimeType) { return mimeType; }
  try {
    mimeType = useBuffer(filePath);
    if (mimeType) { return mimeType; }
    return useOSFile(filePath);
  } catch (error) {
    Log.Error(error);
    return null;
  }
}

module.exports.findMimeType = findMimeType;
