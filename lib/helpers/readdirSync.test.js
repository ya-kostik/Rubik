/*global test expect */

const path = require('path');

test('readdir', () => {
  const readdir = require('./readdirSync');
  let out = readdir(path.join(__dirname, './'));
  expect(out).toContain('readdir.js');
  out = readdir(path.join(__dirname, '../../'));
  expect(out).not.toContain('README.md');
});

test('readdir with each', () => {
  const readdir = require('./readdirSync');
  const names = [];
  readdir(path.join(__dirname, './'), (file, name) => {
    names.push(name);
  });
  expect(names).toContain('readdir');
});

test('read nonexistent folder', () => {
  const readdir = require('./readdirSync');
  expect(() => readdir(path.join(__dirname, './readdir'))).toThrow();
});
