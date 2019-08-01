/**
 * Create a new object containing the difference
 * @param old
 * @param nnew
 * @returns {*}
 * @constructor
 */
function MergeRecords(old, nnew) {
  const oldKeys = Object.keys(old);
  const newKeys = Object.keys(nnew);
  const merged = old;

  newKeys.forEach((k) => {
    if (oldKeys.includes(k) && old[k] !== nnew[k]) {
      merged[k] = nnew[k];
    } else {
      // The key was not present in the old
      merged[k] = nnew[k];
    }
  });

  return merged;
}

module.exports.MergeRecords = MergeRecords;
