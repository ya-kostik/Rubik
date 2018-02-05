module.exports = {
  add(name, module) {
    this[name] = module;
  },
  apps: {},
  app: null
};

module.exports.add = module.exports.add.bind(module.exports);
