const BatchError = require('./BatchError');
class AppStartError extends BatchError {
  constructor(errors) {
    super('Errors that occurred during the start of the application 🙀', errors);
  }
}

module.exports = AppStartError;
