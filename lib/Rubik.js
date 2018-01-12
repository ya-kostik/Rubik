module.exports = {
  add(name, module) {
    this[name] = module;
  }
};

module.exports.add = module.exports.add.bind(module.exports);
