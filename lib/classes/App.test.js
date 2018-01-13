/*global test expect */

const { createKubik, createApp } = require('../../tests/helpers/creators');
const Rubik = require('../../');
const { Kubik, Errors } = Rubik;

class CustomKubik extends Kubik {}

test('Create new App', () => {
  createApp();
});

test('Up new App', async () => {
  const app = createApp();
  await app.up();
});

test('Create and add stock kubik to new App', () => {
  const app = createApp();
  const kubik = createKubik(null, app);
  expect(app.kubiks.size).toBe(1);
  expect(app.kubiks.get(kubik.name)).toBe(kubik);
});

test('Up app with stock kubik must falue, because it not implemented up', async () => {
  const app = createApp();
  const kubik = createKubik(null, app);
  try {
    await app.up();
  } catch (err) {
    const simulatedErr = new Errors.AppStartError([
      new TypeError('Up is not implemented in kubik ' + kubik.name)
    ]);
    expect(err).toEqual(simulatedErr);
    return;
  }
  throw new Error('Not thrown');
});

test('Up app with custom kubik', async () => {
  const app = createApp();
  const kubik = createKubik(CustomKubik, app);
  let isUp = false;
  kubik.up = () => (isUp = true);
  await app.up();
  expect(isUp).toBe(true);
});

test('Up app with custom kubik and dependencies fail, if dependency not found', async () => {
  const app = createApp();
  const kubik = createKubik(CustomKubik);
  kubik.dependencies = ['__UnnecesseryDependency__'];
  app.add([kubik]);
  try {
    await app.up();
  } catch (err) {
    expect(err).toBeInstanceOf(Errors.AppStartError);
    expect(err.message).toMatch(/__UnnecesseryDependency__/);
    return;
  }
  throw new Error('Not thrown');
});

function addInvalidKubik(cb) {
  const app = createApp();
  try {
    cb(app);
  } catch(err) {
    expect(err.message).toMatch(/kubik is not a Kubik instance/);
    return;
  }
  throw new Error('Not thrown');
}

test('Add non Kubik to app instance thrown error', () => {
  addInvalidKubik((app) => {
    app.add({});
  });
});

test('Add non Kubik with no constructor to app instance thrown error', () => {
  addInvalidKubik((app) => {
    app.add(Object.create(null, {}));
  });
});

function addKubikWithInvalidName(addCb) {
  const app = createApp();
  try {
    addCb(app);
  } catch(err) {
    expect(err.message).toMatch(/is not a valid kubik name/);
    return;
  }
  throw new Error('Not thrown');
}

test('Add kubik with no name to app instance thrown error', () => {
  addKubikWithInvalidName((app) => {
    const kubik = createKubik();
    kubik.name = undefined;
    app.add(kubik);
  });
});

test('Add kubik with no name and undefined constructor to app instance thrown error', () => {
  addKubikWithInvalidName((app) => {
    const kubik = Object.create(null, {});
    app.add(kubik, false);
  });
});

test('App with all requirement kubiks start normaly', async () => {
  const app = createApp();
  const kubik1 = createKubik(CustomKubik);
  const kubik2 = createKubik(CustomKubik);
  const kubik3 = createKubik(CustomKubik);
  let ups = 0;
  const up = () => (ups += 1);
  kubik1.dependencies = ['kubik2', 'kubik3'];
  kubik3.dependencies = ['kubik3'];
  kubik1.name = 'kubik1';
  kubik2.name = 'kubik2';
  kubik3.name = 'kubik3';
  kubik1.up = up;
  kubik2.up = up;
  kubik3.up = up;
  app.add([kubik1, kubik2, kubik3]);
  await app.up();
  expect(ups).toBe(3);
});
