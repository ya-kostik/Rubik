const readdir = require('fs').readdirSync;
const processReaddirFiles = require('./processReaddirFiles');

function scandir(dir, each) {
  const files = readdir(dir);
  return processReaddirFiles(files, each);
}

module.exports = scandir;
