/**
 * This module need for remove cyclic dependencies
 * @module Rubik
 */
const Rubik = require('./Rubik');

Rubik.App = require('./classes/App');
Rubik.Kubik = require('./classes/Kubik');
Rubik.Errors = {
  AppStartError: require('./Errors/AppStartError'),
  BatchError: require('./Errors/BatchError')
}

module.exports = Rubik;
