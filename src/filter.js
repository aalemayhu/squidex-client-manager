/**
 * The function for building the filter string (WIP)
 * @param {*} predicate
 * @param {*} operation
 * @param {*} values
 */
function buildFilterString(predicate, operation, values) {
  if (Array.isArray(values)) {
    throw new Error(
      `The filter implementation implementations is very naive and only support comparison for now.
        Please create an issue with the below output https://github.com/scanf/squidex-client-manager/issues/new
        ${JSON.stringify({ predicate, values, operation }, null, 2)}
        `,
    );
  }

  let check = `'${values}'`;
  if (typeof values === 'number') {
    check = values;
  }

  return `${predicate} ${operation} ${check}`;
}

module.exports.buildFilterString = buildFilterString;
