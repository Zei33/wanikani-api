/** @type {import('@jest/types').Config.InitialOptions} */
const baseConfig = require('./jest.config');
const allConfig = {
    ...baseConfig,
    testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.live.test.ts'],
    testPathIgnorePatterns: [],
    // Use the longer timeout from live config to accommodate API calls
    testTimeout: 10000,
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'node',
    testEnvironmentOptions: {
        ...baseConfig.testEnvironmentOptions,
        customExportConditions: ['node', 'node-addons'],
        experimentalVmModules: true
    }
};
module.exports = allConfig;
export {};
