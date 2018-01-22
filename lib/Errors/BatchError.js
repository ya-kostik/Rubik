function getBatchedMessage(errors) {
  if (!Array.isArray(errors)) {
    errors = [];
  }
  let message = '';
  for (const error of errors) {
    const _message = `${error.message}\n\t\t${error.stack}`;
    message += `\t${_message}\n`;
  }
  return message;
}

class BatchError extends Error {
  constructor(message, errors = []) {
    message += `\n${getBatchedMessage(errors)}`;
    message += `Total: ${errors && errors.length ? errors.length : 0}`;
    super(message);
    this.errors = Array.isArray(errors) ? errors : [];
  }
}

// Just for use if some one will chahge the getBatchedMessage & he will need
// super.getBatchedMessage
BatchError.prototype.getBatchedMessage = getBatchedMessage;

module.exports = BatchError;
