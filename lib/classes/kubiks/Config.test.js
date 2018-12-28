/*global test expect */
const path = require('path');
const { createApp, createKubik } = require('../../../tests/helpers/creators');
// Need for add properties to Rubik
require('../../');
const Config = require('./Config');
const defaultPath = path.join(__dirname, '../../../tests/mocks/kubiks/Config/default/');
const anotherPath = path.join(__dirname, '../../../tests/mocks/kubiks/Config/another/');
const anotherAnotherPath = path.join(__dirname, '../../../tests/mocks/kubiks/Config/anotherAnother/')

test('create Config instance and add it to app', async () => {
  const app = createApp();
  const config = createKubik(Config, app);
  expect(app.kubiks.get('config')).toBe(config);
  const anotherConfig = new Config();
  anotherConfig.name = 'anotherConfig';
  app.add(anotherConfig);
  await app.up();
  expect(app.kubiks.get('anotherConfig')).toBe(anotherConfig);
  expect(app.config).toBe(config);
});

test('create Config instance with defaultVolume', () => {
  const config = new Config(defaultPath);
  expect(config.volumes).toEqual([defaultPath]);
});

test('create Config instance with defaultVolume as an array', () => {
  const config = new Config([defaultPath, './']);
  expect(config.volumes).toEqual([defaultPath, './']);
});

test('get field from config by name', () => {
  const config = new Config(defaultPath);
  const http = require(defaultPath + 'http');
  expect(config.get('http')).toEqual(http);
  const clonned = Object.assign({}, http);
  clonned.port = 12345;
  config.volumes.push(anotherPath);
  expect(config.get('http')).toEqual(http);
  expect(config.get('http', false)).toEqual(clonned);
  expect(config.get('testyFn').volumes).toEqual(config.volumes);
  expect(config.get('undefined')).toEqual({});
  config.use({ volumes: [anotherAnotherPath] });
  config.removeCache('http');
  expect(config.get('http').port).toBe(54321);
  expect(config.get('http.port')).toBe(54321);
  config.volumes.push(defaultPath);
  expect(config.get('http.port', false)).toBe(http.port);
  expect(config.get('')).toEqual({});
});

test('get field with problem config file should throw error', () => {
  const config = new Config(anotherPath);
  try {
    config.get('withProblem');
  } catch (err) {
    return expect(err.message).toBe('Problem');
  }
  throw new Error('Not thrown')
});

function clearHttpTest(clearCb) {
  const config = new Config(anotherPath);
  config.get('http');
  expect(config.configs.http).toBeDefined();
  clearCb(config);
  expect(config.configs).toEqual({});
}
test('clearCache should reset cache', () => {
  clearHttpTest((config) => config.clearCache());
});

test('use some config extensions', () => {
  const config = createKubik(Config);
  // undefined extension
  config.use(undefined);
  clearHttpTest((config) => config.use({ clearCache: true }));
});

test('read variable from the env', () => {
  const config = new Config(anotherPath);
  process.env.http_port = '6543';
  const http = config.get('http');
  expect(http.port).toBe(JSON.parse(process.env.http_port));
  process.env.app = '{ "repl": true }';
  expect(config.get('app')).toEqual({ repl: true });
});
