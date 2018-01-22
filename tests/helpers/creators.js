function createApp() {
  const { App } = require('../../');
  const app = new App();
  return app;
}

function createKubik(InstanceClass, app, name) {
  if (!InstanceClass) {
    const { Kubik } = require('../../');
    InstanceClass = Kubik;
  }
  const kubik = new InstanceClass;
  if (name) kubik.name = name;
  if (app) app.addOneKubik(kubik);
  return kubik;
}

module.exports = {
  createApp, createKubik
};
