const readdir = require('fs').readdir;
const processReaddirFiles = require('./processReaddirFiles');

function scandir(dir, each) {
  return new Promise((resolve, reject) => {
    readdir(dir, (err, files) => {
      if (err) return reject(err);
      return resolve(processReaddirFiles(files, each));
    })
  });
}

module.exports = scandir;
