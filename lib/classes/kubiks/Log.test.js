/* global test, expect */
const { createApp, createKubik } = require('../../../tests/helpers/creators');
// Need for add properties to Rubik
require('../../');
const Log = require('./Log');

test('create log and add it to app', async () => {
  const app = createApp();
  const log = createKubik(Log, app);
  await app.up();
  expect(app.log).toBe(log);
  log.info('log from Log test');
});

test('add another loger name', async () => {
  const app = createApp();
  const log = new Log();
  log.name = 'logger';
  app.add(log);
  await app.up();
  expect(app.log).toBeUndefined();
});
