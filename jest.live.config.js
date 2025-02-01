/** @type {import('@jest/types').Config.InitialOptions} */
const baseConfig = require('./jest.config');
const liveConfig = {
    ...baseConfig,
    testMatch: ['**/__tests__/**/*.live.test.ts'],
    testPathIgnorePatterns: [],
    // Increase timeout for live API calls
    testTimeout: 10000,
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'node',
    testEnvironmentOptions: {
        ...baseConfig.testEnvironmentOptions,
        customExportConditions: ['node', 'node-addons'],
        experimentalVmModules: true
    }
};
module.exports = liveConfig;
export {};
