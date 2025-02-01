/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	testMatch: ['**/__tests__/**/*.test.ts'],
	testPathIgnorePatterns: ['\\.live\\.test\\.ts$'],
	transform: {
		'^.+\\.tsx?$': ['ts-jest', {
			useESM: true,
			tsconfig: 'tsconfig.json'
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