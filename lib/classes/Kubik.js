const HooksMixin = require('hooks-mixin');
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
    // if child prototype will contain name or dependencies
    if (!this.name) this.name = this.constructor.name.toLowerCase();
    if (!this.dependencies) this.dependencies = [];
    this.extensions = [];
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
   * apply hooks and clean it (it was here for backward compatibility)
   * @param  {String}  name hook name
   * @return {Promise}
   */
  async applyHooks(name) {
    if (!this.__hooks[name].length) return;
    await this.processHooksAsync(name);
    this.__hooks[name] = [];
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
      this.hook('before', extension.before);
    }
    if (isFunction(extension.after)) {
      this.hook('after', extension.after);
    }
    if (extension.hooks) {
      for (const [name, hooks] of Object.entries(extension.hooks)) {
        const addHook = hook => {
          if (isFunction(hook)) this.hook(name, hook);
        }
        if (Array.isArray(hooks)) hooks.forEach(addHook);
        else addHook(hooks);
      }
    }
    this.extensions.push(extension);
  }
}

module.exports = HooksMixin(Kubik);
