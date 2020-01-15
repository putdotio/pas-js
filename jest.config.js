const { defaults } = require('jest-config')

module.exports = {
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  rootDir: 'src',
}
