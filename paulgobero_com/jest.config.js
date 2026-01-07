
module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    globalSetup: '<rootDir>/jest.globalSetup.js',
    globalTeardown: '<rootDir>/jest.globalTeardown.js',
    verbose: true,
};
