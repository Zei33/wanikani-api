import { WaniKaniRequest } from '../classes/WaniKaniRequest.js';
import type { Stats } from 'fs';
import fs, { Dirent } from 'fs';
import path from 'path';
import { WaniKaniHttpStatus } from '../constants/http.js';

// Mock fs/promises
jest.mock('fs/promises');
const mockFs = jest.requireMock('fs/promises');
jest.spyOn(mockFs, 'mkdir').mockResolvedValue(undefined);
jest.spyOn(mockFs, 'readFile').mockRejectedValue(new Error('File not found'));
jest.spyOn(mockFs, 'writeFile').mockResolvedValue(undefined);
jest.spyOn(mockFs, 'stat').mockRejectedValue(new Error('File not found'));
jest.spyOn(mockFs, 'readdir').mockResolvedValue([]);
jest.spyOn(mockFs, 'unlink').mockResolvedValue(undefined);

// Mock fetch
const mockFetch = jest.fn().mockImplementation(async () => ({
	status: 200,
	ok: true,
	headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
	json: async () => ({ data: 'test' })
}));
global.fetch = mockFetch;

// Create mock Response and Headers
const mockJsonResponse = (body: unknown, status = 200) => ({
	status,
	ok: status >= 200 && status < 300,
	headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
	json: async () => body
}) as Response;

describe('WaniKaniRequest', () => {
	let request: WaniKaniRequest;
	const TEST_API_KEY = 'test-api-key';
	const TEST_BASE_URL = 'https://api.wanikani.com';
	const TEST_API_REVISION = '20170710';
	const TEST_CACHE_DIR = '/tmp/wanikani-cache';

	beforeEach(() => {
		// Clear all mocks
		jest.clearAllMocks();
		mockFetch.mockReset();

		// Create new request instance
		request = new WaniKaniRequest(
			TEST_API_KEY,
			TEST_BASE_URL,
			TEST_API_REVISION,
			TEST_CACHE_DIR
		);

		// Setup default fs mock implementations
		mockFs.mkdir.mockResolvedValue(undefined);
		mockFs.readFile.mockRejectedValue(new Error('File not found'));
		mockFs.writeFile.mockResolvedValue(undefined);
		mockFs.stat.mockRejectedValue(new Error('File not found'));
		mockFs.readdir.mockResolvedValue([]);
		mockFs.unlink.mockResolvedValue(undefined);
	});

	describe('constructor', () => {
		it('should create cache directory on instantiation', () => {
			expect(mockFs.mkdir).toHaveBeenCalledWith(TEST_CACHE_DIR, { recursive: true });
		});
	});

	describe('request', () => {
		it('should make a request with correct headers', async () => {
			mockFetch.mockImplementationOnce(async () => ({
				status: 200,
				ok: true,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => ({ object: 'collection', url: 'test', data: { test: true } })
			}));

			await request.request('subjects');

			const [url, options] = mockFetch.mock.calls[0];
			expect(url.toString()).toBe(`${TEST_BASE_URL}/subjects`);
			expect(options).toEqual(expect.objectContaining({
				headers: expect.objectContaining({
					'Authorization': `Bearer ${TEST_API_KEY}`,
					'Wanikani-Revision': TEST_API_REVISION,
					'Content-Type': 'application/json'
				})
			}));
		});

		it('should handle successful responses', async () => {
			const testData = { test: true };
			mockFetch.mockImplementationOnce(async () => ({
				status: 200,
				ok: true,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => ({ object: 'collection', url: 'test', data: testData })
			}));

			const result = await request.request('subjects');
			expect(result).toEqual(testData);
		});

		it('should handle cache hits', async () => {
			const testData = { test: true };
			const cacheData = {
				data: testData,
				etag: 'test-etag',
				lastModified: new Date().toUTCString()
			};

			// Setup cache hit
			const mockStats = {
				mtimeMs: Date.now(),
				isFile: () => true
			} as Stats;
			mockFs.stat.mockResolvedValue(mockStats);
			mockFs.readFile.mockResolvedValue(JSON.stringify(cacheData));

			// Mock 304 response
			mockFetch.mockImplementationOnce(async () => ({
				status: 304,
				ok: false,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => ({ object: 'collection', url: 'test', data: null })
			}));

			const result = await request.request('subjects', {}, 1000);
			expect(result).toEqual(testData);
		});

		it('should handle error responses', async () => {
			mockFetch.mockImplementationOnce(async () => ({
				status: 401,
				ok: false,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => ({ error: 'Unauthorized' })
			}));

			await expect(request.request('subjects')).rejects.toThrow(
				`HTTP error! status: ${WaniKaniHttpStatus.UNAUTHORIZED}`
			);
		});

		it('should handle network failures', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network error'));
			await expect(request.request('subjects')).rejects.toThrow('Network error');
		});

		it('should handle malformed JSON responses', async () => {
			mockFetch.mockImplementationOnce(async () => ({
				status: 200,
				ok: true,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => { throw new Error('Invalid JSON') }
			}));
			await expect(request.request('subjects')).rejects.toThrow('Invalid JSON');
		});

		it('should handle cache write failures', async () => {
			mockFs.writeFile.mockRejectedValueOnce(new Error('Write failed'));
			mockFetch.mockImplementationOnce(async () => ({
				status: 200,
				ok: true,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => ({ object: 'collection', url: 'test', data: { test: true } })
			}));
			// Should still return data even if cache write fails
			const result = await request.request('subjects');
			expect(result).toEqual({ test: true });
		});
	});

	describe('cleanOldCaches', () => {
		it('should remove expired cache files', async () => {
			const oldFiles = ['cache1.json', 'cache2.json'].map(name => ({
				name,
				isFile: () => true,
				isDirectory: () => false,
				isBlockDevice: () => false,
				isCharacterDevice: () => false,
				isSymbolicLink: () => false,
				isFIFO: () => false,
				isSocket: () => false,
				path: path.join(TEST_CACHE_DIR, name),
				parentPath: TEST_CACHE_DIR
			})) as unknown as Dirent[];
			mockFs.readdir.mockResolvedValue(oldFiles);
			const olderThan = 1000000;
			const mockStats: Stats = {
				mtimeMs: Date.now() - olderThan,
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

			await request.cleanOldCaches(1000);

			expect(mockFs.unlink).toHaveBeenCalledTimes(oldFiles.length);
			oldFiles.forEach(file => {
				expect(mockFs.unlink).toHaveBeenCalledWith(file.path);
			});
		});

		it('should keep valid cache files', async () => {
			const files = ['cache1.json', 'cache2.json'].map(name => ({
				name,
				isFile: () => true,
				isDirectory: () => false,
				isBlockDevice: () => false,
				isCharacterDevice: () => false,
				isSymbolicLink: () => false,
				isFIFO: () => false,
				isSocket: () => false,
				path: path.join(TEST_CACHE_DIR, name),
				parentPath: TEST_CACHE_DIR
			})) as unknown as Dirent[];
			mockFs.readdir.mockResolvedValue(files);
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

			await request.cleanOldCaches(1000000);

			expect(mockFs.unlink).not.toHaveBeenCalled();
		});

		it('should handle directory read failures', async () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
			mockFs.readdir.mockRejectedValueOnce(new Error('Read failed'));
			await expect(request.cleanOldCaches(1000)).resolves.not.toThrow();
			expect(consoleSpy).toHaveBeenCalledWith(
				'Failed to clean cache directory:',
				expect.any(Error)
			);
			consoleSpy.mockRestore();
		});

		it('should skip non-file entries', async () => {
			const files = [
				{
					name: 'dir',
					isFile: () => false,
					isDirectory: () => true,
					path: path.join(TEST_CACHE_DIR, 'dir')
				},
				{
					name: 'file.json',
					isFile: () => true,
					isDirectory: () => false,
					path: path.join(TEST_CACHE_DIR, 'file.json')
				}
			] as unknown as Dirent[];
			
			mockFs.readdir.mockResolvedValue(files);
			mockFs.stat.mockResolvedValue({
				mtimeMs: Date.now() - 2000,
				isFile: () => true
			} as Stats);

			await request.cleanOldCaches(1000);
			expect(mockFs.unlink).toHaveBeenCalledTimes(1);
			expect(mockFs.unlink).toHaveBeenCalledWith(files[1].path);
		});
	});
}); 