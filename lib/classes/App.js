const Rubik = require('../Rubik');

class App {
  constructor() {
    this.kubiks = new Map();
    this._appRequirements = new Map();
  }

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

  async up() {
    const upErrors = [];
    const depHash = {};
    for (const record of this._appRequirements) {
      const kubikName = record[0];
      const kubikRequirements = record[1];
      depHash[kubikName] = {};
      for (const requirement of kubikRequirements) {
        const requirementInstance = this.kubiks.get(requirement + '');
        if (requirementInstance) {
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
      for (const [name, kubik] of this.kubiks) {
        kubik.app = this;
        await kubik.up(depHash[name] || {});
      }
    } catch (err) {
      throw new Rubik.Errors.AppStartError([err]);
    }
  }

  use(extension) {
    if (!extension) return this;
    for (const [name, kubik] of this.kubiks) {
      if (extension[name]) kubik.use(extension[name]);
    }
    return this;
  }
}

module.exports = App;
