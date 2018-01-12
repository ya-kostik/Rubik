class Kubik {
  constructor() {
    this.app = null;
    this.name = 'kubik';
    this.dependencies = [];
  }

  _define(name, value, assign = false) {
    const props = {};
    if (assign === true && typeof value === 'object') {
      Object.assign(props, value);
    } else {
      props.value = value;
    }
    Object.defineProperty(this, name, props);
  }

  up() {
    throw new TypeError('Up is not implemented in kubik ' + this.name);
  }

  use(/* extension */) {
    throw new TypeError('Use is not implemented in kubik' + this.name);
  }
}

module.exports = Kubik;
