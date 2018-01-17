/**
 * This module need for remove cyclic dependencies
 * @module Rubik
 */
const Rubik = require('./Rubik');

Rubik.helpers = require('./helpers');

Rubik.App = require('./classes/App');
Rubik.Kubik = require('./classes/Kubik');
Rubik.Errors = {
  AppStartError: require('./Errors/AppStartError'),
  BatchError: require('./Errors/BatchError')
}

Rubik.Kubiks = {
  Config: require('./classes/kubiks/Config'),
  Log: require('./classes/kubiks/Log')
}


module.exports = Rubik;
