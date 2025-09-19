const base = require('../../../tools/testing/backend/jest.base.config.cjs')

module.exports = {
  ...base,
  displayName: 'publish-srv',
  rootDir: __dirname,
  moduleNameMapper: {
    ...base.moduleNameMapper,
    '^@publish/(.*)$': '<rootDir>/src/$1'
  }
}
