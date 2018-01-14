module.exports = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'lib/**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/coverage/**',
    '!lib/helpers/kindOf.js',
    '!lib/helpers/isPrimitive.js',
    '!lib/helpers/assignDeep.js',
    '!lib/helpers/assignSymbols.js',
  ],
  globals: {

  }
}
