const isFunction = require('lodash/isFunction');

module.exports = function processReaddirFiles(files, each) {
  const out = [];
  for (const file of files) {
    if (file === 'index.js') continue;
    if (file.slice(-3) !== '.js') continue;
    if (isFunction(each)) {
      each(file, file.slice(0, -3));
    }
    out.push(file);
  }
  return out;
};
