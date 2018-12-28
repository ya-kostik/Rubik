const defaultsDeep = require('lodash/defaultsDeep');
const reverse = require('lodash/reverse');

function assignDeep(target, /* sources */) {
  return Object.assign(target, defaultsDeep({}, ...reverse([...arguments])));
}

module.exports = assignDeep;
