/*global test expect */

const path = require('path');

test('readdir', async () => {
  const readdir = require('./readdir');
  let out = await readdir(path.join(__dirname, './'));
  expect(out).toContain('readdir.js');
  out = await readdir(path.join(__dirname, '../../'));
  expect(out).not.toContain('README.md');
});

test('readdir with each', async () => {
  const readdir = require('./readdir');
  const names = [];
  await readdir(path.join(__dirname, './'), (file, name) => {
    names.push(name);
  });
  expect(names).toContain('readdir');
});

test('read nonexistent folder', async () => {
  const readdir = require('./readdir');
  await expect(readdir(path.join(__dirname, './readdir'))).rejects.toThrow();
});
