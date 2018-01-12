/*global test expect */
const Rubik = require('../');

test('Add module into Rubik', () => {
  const module = { moduleField: 'some field value' };
  Rubik.add('some module', module);
  expect(Rubik['some module']).toBe(module);
})
