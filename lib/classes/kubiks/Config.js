const { Kubik } = require('../../');

/**
 * Layered cake, ie config
 * Need to configure the application with layers
 * @class Config
 * @prop {Array<String>} volumes volumes for search configs
 * @prop {Object} configs        cached configs
 */
class Config extends Kubik {
  constructor(defaultVolume) {
    super();
    if (defaultVolume) {
      this.volumes = [defaultVolume];
    } else {
      this.volumes = [];
    }
    this.name = 'config';
    this.configs = {};
  }

  /**
   * Get config
   * @param  {String}  name         name of field what we want to get
   * @param  {Boolean} [cache=true] flag; get config from cache or scan volumes again?
   * @return {Mixed}                config or empty object, if nothing found
   */
  get(name, cache = true) {
    if (cache && this.configs[name]) return this.configs[name];
    this.scan(name);
    return this.configs[name];
  }

  /**
   * Scan volumes to search config field
   * @param  {String} name field name
   * @return {Config}      this
   */
  scan(name) {
    const len = this.volumes.length;
    const currentOptions = {}
    for (var i = 0; i < len; i++) {
      const volume = this.volumes[i];
      try {
        let options = require(`${volume}${name}`);
        if (typeof options === 'function') {
          options = options(this);
        }
        if (typeof options === 'object') {
          Object.assign(currentOptions, options);
        }
      } catch (err) {
        if (/Cannot find module .*?/.test(err.message)) {
          continue;
        }
        throw err;
      }
    }
    this.configs[name] = currentOptions;
    return this;
  }

  /**
   * Remove cached field
   * @param  {String} name field name
   * @return {Config}      this
   */
  removeCache(name) {
    this.configs[name] = undefined;
    return this;
  }

  /**
   * Clear all cached fields
   * @return {Config} this
   */
  clearCache() {
    this.configs = {};
  }

  /**
   * Use extension
   * @param  {Object} extension extension object
   */
  use(extension) {
    if (!extension) return;
    if (Array.isArray(extension.volumes)) {
      this.volumes = this.volumes.concat(extension.volumes);
    }
    if (extension.clearCache) this.clearCache();
  }

  /**
   * up config
   * @return {Config} this
   */
  up() {
    // add config to quick get from app
    // if some one create another config, and change it name, this will be omitted
    if (this.name === 'config' && !this.app.config) this.app.config = this;
  }
}

Config.prototype.reset = Config.prototype.removeCache;

module.exports = Config;