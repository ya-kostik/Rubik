/*global test expect */

const { createKubik } = require('../../tests/helpers/creators');

test('Create new Kubik', () => {
  createKubik();
});

test('When Use “use” method of stock kubik must throw TypeError', () => {
  const kubik = createKubik();
  try {
    kubik.use({});
  } catch (err) {
    expect(err).toEqual(new TypeError('Use is not implemented in kubik' + kubik.name));
    return;
  }
  throw new Error('Not thrown');
});

test('When Use “up” method of stock kubik must throw TypeError', () => {
  const kubik = createKubik();
  try {
    kubik.up({});
  } catch (err) {
    expect(err).toEqual(new TypeError('Up is not implemented in kubik ' + kubik.name));
    return;
  }
  throw new Error('Not thrown');
});

test('Define simple property in kubik', () => {
  const kubik = createKubik();
  kubik._define('a', 'b');
  expect(kubik.a).toBe('b');
  kubik._define('b', {
    get() { return 'a' }
  }, true);
  expect(kubik.b).toBe('a');
})
