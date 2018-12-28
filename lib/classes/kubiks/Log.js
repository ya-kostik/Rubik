const { Kubik } = require('../../Rubik');

class Log extends Kubik {
  up() {
    // add log to quick get from app
    // if some one create another log, and change it name, this will be omitted
    if (this.name === 'log' && !this.app.log) this.app.log = this;
  }
}

for (const method of ['log', 'info', 'warn', 'error', 'dir']) {
  Log.prototype[method] = function() {
    /* eslint-disable */
    console[method](...arguments);
    /* eslint-enable */
  }
}

Log.prototype.name = 'log';

module.exports = Log;
