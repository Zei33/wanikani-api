import { WaniKaniAPI } from '../classes/WaniKaniAPI.js';
import type { Stats } from 'fs';
import fs from 'fs/promises';

// Mock fs/promises
jest.mock('fs/promises');
const mockFs = jest.mocked(fs);

// Mock environment variables
const { env } = process;

describe('WaniKaniAPI', () => {
	const TEST_API_KEY = 'test-api-key';
	const TEST_PACKAGE_NAME = 'test-package';
	const INIT_TIMEOUT = 100;

	beforeEach(() => {
		// Reset environment
		process.env = { ...env };
		process.env.WANIKANI_API_KEY = TEST_API_KEY;

		// Clear all mocks
		jest.clearAllMocks();

		// Setup default fs mock implementations
		mockFs.mkdir.mockResolvedValue(undefined);
		mockFs.readFile.mockResolvedValue(JSON.stringify({ name: TEST_PACKAGE_NAME }));
		const mockStats: Stats = {
			mtimeMs: Date.now(),
			isFile: () => true,
			isDirectory: () => false,
			isSymbolicLink: () => false,
			isBlockDevice: () => false,
			isCharacterDevice: () => false,
			isFIFO: () => false,
			isSocket: () => false,
			size: 0,
			blocks: 0,
			blksize: 0,
			atimeMs: 0,
			ctimeMs: 0,
			birthtimeMs: 0,
			atime: new Date(),
			mtime: new Date(),
			ctime: new Date(),
			birthtime: new Date(),
			dev: 0,
			ino: 0,
			mode: 0,
			nlink: 0,
			uid: 0,
			gid: 0,
			rdev: 0
		};
		mockFs.stat.mockResolvedValue(mockStats);
	});

	afterEach(() => {
		process.env = env;
	});

	describe('constructor', () => {
		it('should initialize with API key from environment', () => {
			const api = new WaniKaniAPI();
			expect(api).toBeInstanceOf(WaniKaniAPI);
		});

		it('should initialize with provided API key', () => {
			const customKey = 'custom-api-key';
			const api = new WaniKaniAPI(customKey);
			expect(api).toBeInstanceOf(WaniKaniAPI);
		});

		it('should throw error when no API key is available', () => {
			delete process.env.WANIKANI_API_KEY;
			expect(() => new WaniKaniAPI()).toThrow('WaniKani API key is required');
		});
	});

	describe('endpoint initialization', () => {
		it('should initialize all endpoint properties', async () => {
			const api = new WaniKaniAPI();
			
			// Wait for initialization to complete
			await new Promise(resolve => {
				setTimeout(resolve, INIT_TIMEOUT);
			});

			expect(api.user).toBeDefined();
			expect(api.assignments).toBeDefined();
			expect(api.subjects).toBeDefined();
			expect(api.reviews).toBeDefined();
			expect(api.reviewStatistics).toBeDefined();
			expect(api.studyMaterials).toBeDefined();
			expect(api.resets).toBeDefined();
			expect(api.levelProgressions).toBeDefined();
			expect(api.spacedRepetitionSystems).toBeDefined();
			expect(api.summary).toBeDefined();
			expect(api.voiceActors).toBeDefined();
		});
	});

	describe('cache initialization', () => {
		it('should use package name from package.json for cache directory', async () => {
			const api = new WaniKaniAPI();
			
			// Wait for initialization to complete
			await new Promise(resolve => {
				setTimeout(resolve, INIT_TIMEOUT);
			});

			expect(mockFs.readFile).toHaveBeenCalledWith(
				expect.stringContaining('package.json'),
				'utf-8'
			);
		});

		it('should fall back to default name if package.json is not found', async () => {
			mockFs.readFile.mockRejectedValue(new Error('File not found'));
			
			const api = new WaniKaniAPI();
			
			// Wait for initialization to complete
			await new Promise(resolve => {
				setTimeout(resolve, INIT_TIMEOUT);
			});

			expect(mockFs.readFile).toHaveBeenCalled();
		});
	});

	describe('isContentAccessible', () => {
		it('should return true for levels within subscription limit', async () => {
			const api = new WaniKaniAPI();
			
			// Mock user endpoint response
			const mockUserResponse = {
				object: 'user',
				url: 'https://api.wanikani.com/v2/user',
				data_updated_at: '2024-01-01T00:00:00.000000Z',
				subscription: {
					active: true,
					type: 'recurring',
					max_level_granted: 60,
					period_ends_at: '2024-12-31T23:59:59.000000Z'
				},
				level: 1,
				current_vacation_started_at: null,
				created_at: '2024-01-01T00:00:00.000000Z',
				updated_at: '2024-01-01T00:00:00.000000Z'
			};

			// @ts-expect-error: Accessing private property for testing
			api.user = {
				get: jest.fn().mockResolvedValue(mockUserResponse)
			};

			const result = await api.isContentAccessible(30);
			expect(result).toBe(true);
		});

		it('should return false for levels beyond subscription limit', async () => {
			const api = new WaniKaniAPI();
			
			// Mock user endpoint response
			const mockUserResponse = {
				object: 'user',
				url: 'https://api.wanikani.com/v2/user',
				data_updated_at: '2024-01-01T00:00:00.000000Z',
				subscription: {
					active: true,
					type: 'recurring',
					max_level_granted: 3,
					period_ends_at: '2024-12-31T23:59:59.000000Z'
				},
				level: 1,
				current_vacation_started_at: null,
				created_at: '2024-01-01T00:00:00.000000Z',
				updated_at: '2024-01-01T00:00:00.000000Z'
			};

			// @ts-expect-error: Accessing private property for testing
			api.user = {
				get: jest.fn().mockResolvedValue(mockUserResponse)
			};

			const result = await api.isContentAccessible(30);
			expect(result).toBe(false);
		});

		it('should handle API call failures', async () => {
			const api = new WaniKaniAPI();
			// @ts-expect-error: Accessing private property for testing
			api.user = {
				get: jest.fn().mockRejectedValue(new Error('API Error'))
			};
			await expect(api.isContentAccessible(30)).rejects.toThrow('API Error');
		});

		it('should handle missing subscription data', async () => {
			const api = new WaniKaniAPI();
			// @ts-expect-error: Accessing private property for testing
			api.user = {
				get: jest.fn().mockResolvedValue({
					object: 'user',
					url: 'https://api.wanikani.com/v2/user',
					data_updated_at: '2024-01-01T00:00:00.000000Z',
					subscription: null,
					level: 1,
					current_vacation_started_at: null,
					created_at: '2024-01-01T00:00:00.000000Z',
					updated_at: '2024-01-01T00:00:00.000000Z'
				})
			};
			const result = await api.isContentAccessible(30);
			expect(result).toBe(false);
		});

		it('should validate level numbers', async () => {
			const api = new WaniKaniAPI();
			await expect(api.isContentAccessible(-1)).rejects.toThrow();
			await expect(api.isContentAccessible(0)).rejects.toThrow();
			await expect(api.isContentAccessible(1.5)).rejects.toThrow();
		});
	});
}); 