const HooksMixin = require('hooks-mixin');
const Rubik = require('../Rubik');
const isFunction = require('lodash/isFunction');

/**
 * App for Rubik kubiks, main point for your app
 * @namespace Rubik
 * @class App
 * @prop {Map} kubiks kubiks of your application
 * @prop {Boolean} isUpped indicates, upped application or not
 */
class App {
  constructor(kubiks) {
    this.kubiks = new Map();
    this.isUpped = false;
    /**
     * set of kubiks' names to start. Setups when application is starting up
     * @type {Set|null}
     */
    this._partial = null;
    /**
     * use for calc requirements of app by dependencies of kubiks
     * @type {Map}
     */
    this._appRequirements = new Map();
    if (this.name) {
      Rubik.apps[this.name] = this;
    } else {
      Rubik.app = this;
    }

    if (kubiks) this.add(...arguments);
  }

  /**
   * get kubik by name
   * @param  {String} kubikName name of kubik
   * @return {Rubik.Kubik}      kubik
   */
  get(kubikName) {
    return this.kubiks.get(kubikName) || null;
  }

  /**
   * add new kubiks to app
   * @param {Array<Rubik.Kubik>|Rubik.Kubik} kubiks kubiks to add
   * @param {Boolean}                        check  check or not, kubik is instanceof Kubik
   */
  add(kubiks, check) {
    if (Array.isArray(kubiks)) {
      for (const kubik of kubiks) {
        this.addOne(kubik, check);
      }
      return;
    }
    return this.addOne(kubiks, check);
  }

  /**
   * get name of kubik
   * @param  {Mixed} kubik
   * @return {String|undefined} name
   */
  getKubikName(kubik) {
    return kubik.name
            ? kubik.name + ''
            : (kubik.constructor ? kubik.constructor.name.toLowerCase() : undefined);
  }

  /**
   * check is kubik correct
   * @param  {Mixed} kubik
   * @throw {TypeError} if kubik is invalid
   */
  checkKubikType(kubik) {
    if (kubik instanceof Rubik.Kubik) return;
    const name = this.getKubikName(kubik);
    throw new TypeError(`${name ? name : 'Nameless'} kubik is not Kubik's instance`);
  }

  /**
   * add a kubik
   * @param {Rubik.Kubik}  kubik        kubik to add
   * @param {Boolean}     [check=true] check or not, kubik is instanceof Kubik
   */
  addOne(kubik, check = true) {
    if (check) this.checkKubikType(kubik);
    const name = this.getKubikName(kubik);
    if (!name) throw new TypeError('Kubik is nameless');
    this.kubiks.set(name, kubik);
    if (Array.isArray(kubik.dependencies) && kubik.dependencies.length) {
      this._appRequirements.set(name, kubik.dependencies);
    }
  }

  /**
   * Find and check dependencies of kubiks
   * @param  {Set|null} [partial=null] set of kubiks to start
   * @return {Object} dependencies' hash
   */
  processRequirements(partial = null) {
    /**
     * Errors when up
     * @type {Array}
     */
    const errors = [];
    /**
     * Hash of dependencies
     * @type {Object}
     */
    const depHash = {};
    for (const [name, dependencies] of this._appRequirements) {
      if (partial && !partial.has(name)) continue;
      depHash[name] = {};
      for (const item of dependencies) {
        const req = item + '';
        const reqKubik = this.kubiks.get(req);
        if (reqKubik && (!partial || partial.has(req))) {
          depHash[name][req] = reqKubik;
          continue;
        }
        errors.push(
          new ReferenceError(`Can't find required kubik ${req} of ${name}`)
        );
      }
    }
    if (errors.length) throw new Rubik.Errors.AppStartError(errors);
    return depHash;
  }

  /**
   * up app
   * @param {Set} [partial=null] set of kubiks to start
   * @return {Promise}
   */
  async up(partial = null) {
    if (partial) {
      if (!(partial instanceof Set)) partial = null;
    }
    // Set partial
    this._partial = partial;

    // Up kubiks
    try {
      // Hooks atStart
      await this.processHooksAsync('atStart');
      // Find and check dependencies
      const depHash = this.processRequirements();
      // Hooks before up
      await this.processHooksAsync('before');

      /**
       * Kubiks to call after, after up
       * @type {Set}
       */
      const after = new Set();
      for (const [name, kubik] of this.kubiks) {
        if (partial && !partial.has(name + '')) continue;
        kubik.app = this;
        await kubik.up(depHash[name] || {});
        if (isFunction(kubik.after)) after.add(kubik);
        // Clean extensions, if no “after” exists
        else kubik.extensions = [];
      }
      // Hooks after up
      await this.processHooksAsync('after');
      // Call after step of kubik
      for (const kubik of after) {
        await kubik.after();
        kubik.extensions = [];
      }
      // Hooks atEnd
      await this.processHooksAsync('atEnd');
      this.isUpped = true;
    } catch (err) {
      throw new Rubik.Errors.AppStartError([err]);
    }
  }

  /**
   * down app
   * @return {Promise}
   */
  async down() {
    await this.processHooksAsync('beforeDown');
    const promisses = [];

    for (const [name, kubik] of this.kubiks) {
      if (this._partial && !this._partial.has(name)) continue;
      if (isFunction(kubik.down)) promisses.push(kubik.down());
    }

    await Promise.all(promisses);
    this.isUpped = false;
    await this.processHooksAsync('afterDown');
    return;
  }

  /**
   * use extension for app and kubiks
   * @param  {Object} extension extension
   * @return {Rubik.App}        this
   */
  use(extension) {
    if (!extension) return this;
    for (const [name, kubik] of this.kubiks) {
      if (extension[name]) kubik.use(extension[name]);
    }
    return this;
  }
}

module.exports = HooksMixin(App);
