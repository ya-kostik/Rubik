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
  use(/* extension */) {
    throw new TypeError('Use is not implemented in kubik' + this.name);
  }
}

module.exports = Kubik;
