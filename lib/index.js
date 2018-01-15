/**
 * This module need for remove cyclic dependencies
 * @module Rubik
 */
const Rubik = require('./Rubik');

Rubik.helpers = {
  isPrimitive: require('./helpers/isPrimitive'),
  kindOf: require('./helpers/kindOf'),
  assignDeep: require('./helpers/assignDeep')
}

Rubik.App = require('./classes/App');
Rubik.Kubik = require('./classes/Kubik');
Rubik.Errors = {
  AppStartError: require('./Errors/AppStartError'),
  BatchError: require('./Errors/BatchError')
}

Rubik.Kubiks = {
  Config: require('./classes/kubiks/Config')
}


module.exports = Rubik;
