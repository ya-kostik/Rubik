const readdir = require('fs').readdir;
const isFunction = require('lodash/isFunction');

function scandir(dir, each) {
  return new Promise((resolve, reject) => {
    readdir(dir, (err, files) => {
      if (err) return reject(err);
      const out = [];
      for (const file of files) {
        if (file === 'index.js') continue;
        if (file.slice(-3) !== '.js') continue;
        if (isFunction(each)) {
          each(file, file.slice(0, -3));
        }
        out.push(file);
      }
      return resolve(out);
    })
  });
}

module.exports = scandir;
