const Rubik = require('../Rubik');
const isFunction = require('lodash/isFunction');

/**
 * App for Rubik kubiks, main point for your app
 * @namespace Rubik
 * @class App
 * @prop {Map} kubiks kubiks of your application
 * @prop {Map} _appRequirements use for calc requirements of app by dependencies of kubiks
 */
class App {
  constructor() {
    this.kubiks = new Map();
    this._appRequirements = new Map();
    if (this.name) {
      Rubik.apps[this.name] = this;
    } else {
      Rubik.app = this;
    }
  }

  /**
   * add new kubiks to app
   * @param {Array<Rubik.Kubik>|Rubik.Kubik} kubiks kubiks to add
   * @param {Boolean}                        check  check or not, kubik is instanceof Kubik
   */
  add(kubiks, check) {
    if (Array.isArray(kubiks)) {
      for (const kubik of kubiks) {
        this.addOneKubik(kubik, check);
      }
    } else {
      return this.addOneKubik(kubiks, check);
    }
    return true;
  }

  /**
   * add a kubik
   * @param {Rubik.Kubik}  kubik        kubik to add
   * @param {Boolean}     [check=true] check or not, kubik is instanceof Kubik
   */
  addOneKubik(kubik, check = true) {
    if (check) {
      if (!(kubik instanceof Rubik.Kubik)) {
        throw new TypeError(
          (kubik && kubik.constructor && kubik.constructor.name ? kubik.constructor.name : 'Unnamed') +
         ' kubik is not a Kubik instance'
        )
      }
    }
    if (!kubik.name) {
      throw new TypeError(kubik.name + ' is not a valid kubik name');
    }
    const name = kubik.name + '';
    this.kubiks.set(name, kubik);
    if (Array.isArray(kubik.dependencies) && kubik.dependencies.length) {
      this._appRequirements.set(name, kubik.dependencies);
    }
    return true;
  }

  /**
   * up app
   * @return {Promise}
   */
  async up(partial = null) {
    if (partial) {
      if (!(partial instanceof Set)) partial = null;
    }
    const upErrors = [];
    const depHash = {};
    for (const record of this._appRequirements) {
      if (partial && !partial.has(record[0])) continue;
      const kubikName = record[0];
      const kubikRequirements = record[1];
      depHash[kubikName] = {};
      for (const requirement of kubikRequirements) {
        const requirementInstance = this.kubiks.get(requirement + '');
        if (requirementInstance && (!partial || partial.has(requirement + ''))) {
          depHash[kubikName][requirement + ''] = requirementInstance;
          continue;
        }
        upErrors.push(
          new TypeError(`Can't find required kubik ${requirement} of ${kubikName}`)
        );
      }
    }
    if (upErrors.length) throw new Rubik.Errors.AppStartError(upErrors);
    try {
      const _afterKubiks = new Set();
      for (const [name, kubik] of this.kubiks) {
        if (partial && !partial.has(name + '')) continue;
        kubik.app = this;
        await kubik.up(depHash[name] || {});
        if (isFunction(kubik.after)) {
          _afterKubiks.add(kubik);
        }
      }
      for (const kubik of _afterKubiks) {
        await kubik.after();
      }
    } catch (err) {
      throw new Rubik.Errors.AppStartError([err]);
    }
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

module.exports = App;
