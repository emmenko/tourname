module.exports = {
  runner: 'jest-runner-eslint',
  displayName: 'eslint',
  moduleFileExtensions: ['js'],
  testMatch: ['<rootDir>/packages/**/*.js'],
  testPathIgnorePatterns: ['node_modules', 'build', 'lib', 'dist'],
  watchPlugins: ['jest-plugin-filename'],
};
