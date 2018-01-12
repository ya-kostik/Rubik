/*global test expect */
const BatchError = require('./BatchError');

test('Create BatchError instance with no errors', () => {
  const err = new BatchError('test error');
  expect(err.message).toBe('test error\nTotal: 0');
});

test('Create BatchError instance with non array errors', () => {
  const err = new BatchError('test error', null);
  expect(err.message).toBe('test error\nTotal: 0');
});

test('Create BatchError instance with errors', () => {
  const err = new BatchError('test error', [new Error('a')]);
  expect(err.message).toBe('test error\n\tError: a\nTotal: 1');
});
