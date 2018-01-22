const isFunction = require('lodash/isFunction');
/**
 * abstract App Kubik class
 * The parent of all Kubiks
 * @namespace Rubik
 * @class Kubik
 * @prop {null|Rubik.App} app          application of the kubik
 * @prop {String}         name         name of kubik
 * @prop {Array}          dependencies dependencies of kubik (another kubiks names)
 */
class Kubik {
  constructor() {
    this.app = null;
    this.name = 'kubik';
    this.dependencies = [];
    this.extensions = [];
    this.hooks = {
      before: [],
      after: []
    }
  }

  /**
   * define property
   * @param  {String}  name           name of property
   * @param  {Mixed}   value          value, or property options
   * @param  {Boolean} [assign=false] use value as options or value
   * @return {Rubik.Kubik}            this
   */
  _define(name, value, assign = false) {
    const props = {};
    if (assign === true && typeof value === 'object') {
      Object.assign(props, value);
    } else {
      props.value = value;
    }
    Object.defineProperty(this, name, props);
    return this;
  }

  /**
   * apply hooks
   * @param  {String}  name hook name
   * @return {Promise}
   */
  async applyHooks(name) {
    if (!this.hooks[name].length) return;
    for (const hook of this.hooks[name]) {
      await hook(this);
    }
    this.hooks[name] = [];
  }

  /**
   * up kubik
   * @param {Object} dependencies of kubik
   */
  up(/* dependencies */) {
    throw new TypeError('Up is not implemented in kubik ' + this.name);
  }

  /**
   * use extension of kubik
   * @param extension of kubik
   */
  use(extension) {
    if (!extension) return;
    if (isFunction(extension.before)) {
      this.hooks.before.push(extension.before);
    }
    if (isFunction(extension.after)) {
      this.hooks.after.push(extension.after);
    }
    this.extensions.push(extension);
  }
}

module.exports = Kubik;
