/*global test expect jest */

const { createKubik, createApp } = require('../../tests/helpers/creators');
const Rubik = require('../../');
const { Kubik, Errors } = Rubik;

class CustomKubik extends Kubik {}
CustomKubik.prototype.name = 'kubik';

class KubikWithDown extends Kubik {
  up() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isDown = false;
        resolve();
      }, 10);
    });
  }

  down() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isDown = true;
        resolve();
      }, 10);
    });
  }
}

KubikWithDown.prototype.name = 'downer';

test('Create new App', () => {
  const app = createApp();
  expect(Rubik.app).toBe(app);
});

test('Up new App', async () => {
  Rubik.App.prototype.name = 'test';
  const app = createApp();
  await app.up();
  expect(Rubik.apps.test).toBe(app);
});

test('Create and add stock kubik to new App', () => {
  const app = createApp();
  const kubik = createKubik(null, app);
  expect(app.kubiks.size).toBe(1);
  expect(app.kubiks.get(kubik.name)).toBe(kubik);
  expect(app.get(kubik.name)).toBe(kubik);
  expect(app.get('anotherName')).toBe(null);
});

test('Up app with stock kubik must falue, because it not implemented up', async () => {
  const app = createApp();
  const kubik = createKubik(null, app);
  try {
    await app.up(true);
  } catch (err) {
    expect(err.errors).toEqual([new TypeError('Up is not implemented in kubik ' + kubik.name)]);
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
    expect(err.message).toMatch(/(kubik is not Kubik's instance)/);
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
    expect(err.message).toMatch(/Kubik is nameless/);
    return;
  }
  throw new Error('Not thrown');
}

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

test('Use extension for App kubiks', () => {
  const app = createApp();
  const kubik = createKubik(CustomKubik, app);
  let use = false;
  kubik.use = (extension) => {
    use = extension;
  };
  app.use({ kubik: true });
  app.use({ rubik: true });
  app.use(null);
  expect(use).toBe(true);
});

test('use kubik with after hook', async () => {
  const kubik = createKubik(CustomKubik);
  const result = [];
  kubik.after = () => result.push('after');
  kubik.up = () => result.push('up');
  const app = createApp();
  app.add(kubik);
  await app.up();
  expect(result).toEqual(['up', 'after']);
});

test('partial app start', async () => {
  const app = createApp();
  const kubik1 = createKubik(CustomKubik, null, 'kubik1');
  kubik1.dependencies.push('kubik4');
  const kubik2 = createKubik(CustomKubik, null, 'kubik2');
  kubik2.dependencies.push('kubik3', 'kubik4');
  kubik2.name = 'kubik2';
  app.add([kubik1, kubik2]);
  let uses = 0;
  const kubik3 = createKubik(CustomKubik, app, 'kubik3');
  const kubik4 = createKubik(CustomKubik, app, 'kubik4');
  const up = () => uses += 1;
  kubik1.up = up;
  kubik2.up = up;
  kubik3.up = up;
  kubik4.up = up;
  await app.up(new Set(['kubik1', 'kubik4']));
  expect(uses).toBe(2);
});

test('Down app', async () => {
  const app = createApp();
  // Create kubik with up and down methods
  createKubik(KubikWithDown, app);
  await app.up();
  // expect isUpped is true
  expect(app.isUpped).toBe(true);
  // get downer kubik to check isDown field of it (defined in KubikWithDown)
  let downer = app.get('downer');
  // Upped KubikWithDown's instance should contain isDown field = false
  expect(downer.isDown).toBe(false);
  await app.down();
  expect(app.isUpped).toBe(false);
  downer = app.get('downer');
  // Downed KubikWithDown's instance should contain isDown field = true
  expect(downer.isDown).toBe(true);
});

test('Run scripts', async () => {
  const app = createApp();
  app.add([
    new Rubik.Kubiks.Log(),
    new Rubik.Kubiks.Config(),
    new KubikWithDown()
  ]);

  const exit = jest.fn();
  const exitCode = 0;

  app.exit = exit;

  const script = jest.fn(async (application) => {
    expect(application).toBe(app);
  });

  await app.runScript(script, new Set(['log', 'config', 'downer']));

  expect(app.downer.isDown).toBe(true);

  expect(script.mock.calls.length).toBe(1);
  expect(exit.mock.calls.length).toBe(1);
  expect(exit.mock.calls[0][0]).toBe(exitCode);
});

test('Run bad scripts fails', async () => {
  const app = createApp();
  const kubik = createKubik(null, app, 'log');
  kubik.up = jest.fn();

  const exit = jest.fn();
  const exitCode = 1;

  app.exit = exit;

  const err = new Error('test');

  const script = jest.fn(async () => {
    throw err;
  });

  kubik.error = jest.fn((error) => {
    expect(error).toBe(err);
  });

  await app.runScript(script);

  expect(exit.mock.calls.length).toBe(1);
  expect(exit.mock.calls[0][0]).toBe(exitCode);

  expect(kubik.error.mock.calls.length).toBe(1);
});

test('Statically attach application to object', () => {
  const app = createApp();
  const App = app.constructor;
  const object = Object.create(null);

  App.attach(app, object);

  expect(App.extract(object)).toBeDefined();
  expect(App.extract(object)).toBe(app);
});

test('Statically detach application from object', () => {
  const app = createApp();
  const App = app.constructor;
  const object = Object.create(null);

  expect(App.extract(object)).toBe(null);
  App.attach(app, object);
  expect(App.extract(object)).toBe(app);
  App.detach(object);
  expect(App.extract(object)).toBe(null);
});

test('Statically extract application from object', () => {
  const app = createApp();
  const App = app.constructor;
  const object = Object.create(null);

  App.attach(app, object);

  expect(App.extract(object)).toBe(app);
});

test('Statically extract non-existing application from object', () => {
  const app = createApp();
  const App = app.constructor;
  const object = Object.create(null);

  expect(App.extract(object)).toBe(null);
});

test('Attach application to object', () => {
  const app = createApp();
  const object = Object.create(null);

  app.attach(object);

  expect(app.extract(object)).toBeDefined();
  expect(app.extract(object)).toBe(app);
});

test('Detach application from object', () => {
  const app = createApp();
  const object = Object.create(null);

  expect(app.extract(object)).toBe(null);
  app.attach(object);
  expect(app.extract(object)).toBe(app);
  app.detach(object);
  expect(app.extract(object)).toBe(null);
});

test('Detach does not remove another application from object', () => {
  const app = createApp();
  const app2 = createApp();
  const App = app.constructor;
  const object = Object.create(null);

  App.attach(app2, object);

  app.detach(object);
  expect(app.extract(object)).toBe(app2);
});

test('Extract application from object', () => {
  const app = createApp();
  const object = Object.create(null);

  app.attach(object);
  expect(app.extract(object)).toBe(app);
});
