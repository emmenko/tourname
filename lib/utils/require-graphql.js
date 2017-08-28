const path = require('path');
const { readFileSync } = require('fs');

// At the moment there is no proper way of loading `.graphql` or `.gql` files
// in nodejs. This workaround basically uses `readFileSync` to read the file
// content as a string.
// https://github.com/apollographql/graphql-tools/issues/273
module.exports = folderPath => filePath =>
  readFileSync(path.join(folderPath, filePath), 'utf-8');
