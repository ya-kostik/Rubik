/*global test expect */

const { createKubik } = require('../../tests/helpers/creators');

test('Create new Kubik', () => {
  createKubik();
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
    get() { return 'a'; }
  }, true);
  expect(kubik.b).toBe('a');
});

test('Use with extensions and with hooks', async () => {
  const kubik = new createKubik();
  kubik.use(null);
  let hooked = 0;
  expect(kubik.extensions.length).toBe(0);
  kubik.use({
    before() { hooked += 1; },
    after() { hooked += 2; },
    add: 5
  });
  expect(kubik.extensions.length).toBe(1);
  expect(kubik.__hooks.before.length).toBe(1);
  expect(kubik.__hooks.after.length).toBe(1);
  await kubik.applyHooks('before');
  await kubik.applyHooks('after');
  expect(hooked).toBe(3);
  expect(kubik.__hooks.before.length).toBe(0);
  expect(kubik.__hooks.after.length).toBe(0);
  await kubik.applyHooks('before');
  kubik.use({});
  // Hook for test
  const hook = hookKubik => {
    expect(hookKubik).toBe(kubik);

    hooked -= 4;
  };
  // Use extension for hooks
  kubik.use({
    hooks: {
      'some-hook': [ hook ],
      'another-hook': hook
    }
  });
  await kubik.processHooksAsync('some-hook');
  expect(hooked).toBe(-1);
  kubik.processHooks('another-hook');
  expect(hooked).toBe(-5);
});

test('Apply empty hook do nothing', async () => {
  const kubik = new createKubik();
  await kubik.applyHooks('blablablabla');
});
