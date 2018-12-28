/*global test expect */

const assignDeep = require('./assignDeep');

test('mergeDeep call', () => {
  const a = { http: { port: 1992, cors: { origin: '*' } } };
  const b = { http: { port: 1993, host: 'http://localhost' } };
  const c = { paper: { token: 'abcd' }, http: { port: 2000 } };
  expect(assignDeep(a, b, c)).toEqual({
    http: {
      port: 2000,
      host: 'http://localhost',
      cors: { origin: '*' }
    },
    paper: { token: 'abcd' }
  });
});
