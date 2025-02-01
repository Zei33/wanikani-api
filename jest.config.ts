/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/__tests__/**/*.test.ts'],
	transform: {
		'^.+\\.tsx?$': ['ts-jest', {
			useESM: true
		}]
	},
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1'
	},
	extensionsToTreatAsEsm: ['.ts'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	testEnvironmentOptions: {
		customExportConditions: ['node', 'node-addons']
	}
};

module.exports = config; 