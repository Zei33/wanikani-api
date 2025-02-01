import { AssignmentsEndpoint } from '../../classes/endpoints/AssignmentsEndpoint.js';
import { WaniKaniRequest } from '../../classes/WaniKaniRequest.js';
import type { ApiResponse, Assignment } from '../../types/wanikani.js';
import fs from 'fs/promises';

// Mock fs/promises
jest.mock('fs/promises');
const mockFs = jest.mocked(fs);

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('AssignmentsEndpoint', () => {
	const TEST_API_KEY = 'test-api-key';
	const TEST_BASE_URL = 'https://api.wanikani.com/v2/';
	const TEST_API_REVISION = '20170710';
	const TEST_CACHE_DIR = '/tmp/wanikani-cache';
	let request: WaniKaniRequest;
	let endpoint: AssignmentsEndpoint;

	beforeEach(() => {
		// Clear all mocks
		jest.clearAllMocks();

		// Setup default fs mock implementations
		mockFs.mkdir.mockResolvedValue(undefined);
		mockFs.readFile.mockRejectedValue(new Error('File not found'));
		mockFs.writeFile.mockResolvedValue(undefined);
		mockFs.stat.mockRejectedValue(new Error('File not found'));

		// Setup default fetch mock
		mockFetch.mockImplementation(async () => ({
			status: 200,
			ok: true,
			headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
			json: async () => ({ data: 'test' })
		}));

		// Create request and endpoint instances
		request = new WaniKaniRequest(TEST_API_KEY, TEST_BASE_URL, TEST_API_REVISION, TEST_CACHE_DIR);
		endpoint = new AssignmentsEndpoint(request);
	});

	describe('getAll', () => {
		it('should make a request to get all assignments', async () => {
			const mockData = [{
				id: 1,
				object: 'assignment',
				subject_id: 123,
				subject_type: 'radical',
				level: 1,
				srs_stage: 1,
				unlocked_at: '2020-01-01T00:00:00.000000Z',
				started_at: '2020-01-02T00:00:00.000000Z',
				passed_at: null,
				available_at: '2020-01-03T00:00:00.000000Z',
				burned_at: null,
				resurrected_at: null,
				hidden: false
			}];

			const mockResponse = {
				object: 'collection',
				url: 'https://api.wanikani.com/v2/assignments',
				pages: {
					per_page: 500,
					next_url: null,
					previous_url: null
				},
				total_count: 1,
				data_updated_at: '2020-01-01T00:00:00.000000Z',
				data: mockData,
				additional_data: {}
			};

			mockFetch.mockImplementationOnce(async () => ({
				status: 200,
				ok: true,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => mockResponse
			}));

			const result = await endpoint.getAll();

			// Verify the request was made correctly
			expect(mockFetch).toHaveBeenCalledWith(
				`${TEST_BASE_URL}assignments`,
				expect.objectContaining({
					headers: expect.objectContaining({
						'Authorization': `Bearer ${TEST_API_KEY}`,
						'Wanikani-Revision': TEST_API_REVISION
					})
				})
			);

			// Verify the response was processed correctly
			expect(result).toEqual(mockData);
		});

		it('should handle API errors', async () => {
			mockFetch.mockImplementationOnce(async () => ({
				status: 401,
				ok: false,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => ({ error: 'Invalid API key' })
			}));

			await expect(endpoint.getAll()).rejects.toThrow('HTTP error! status: 401');
		});

		it('should handle network errors', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network error'));
			await expect(endpoint.getAll()).rejects.toThrow('Network error');
		});
	});

	describe('get', () => {
		it('should make a request to get a specific assignment', async () => {
			const mockData = {
				id: 1,
				object: 'assignment',
				subject_id: 123,
				subject_type: 'radical',
				level: 1,
				srs_stage: 1,
				unlocked_at: '2020-01-01T00:00:00.000000Z',
				started_at: '2020-01-02T00:00:00.000000Z',
				passed_at: null,
				available_at: '2020-01-03T00:00:00.000000Z',
				burned_at: null,
				resurrected_at: null,
				hidden: false
			};

			const mockResponse = {
				object: 'assignment',
				url: 'https://api.wanikani.com/v2/assignments/1',
				data_updated_at: '2020-01-01T00:00:00.000000Z',
				data: mockData,
				additional_data: {}
			};

			mockFetch.mockImplementationOnce(async () => ({
				status: 200,
				ok: true,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => mockResponse
			}));

			const result = await endpoint.get(1);

			// Verify the request was made correctly
			expect(mockFetch).toHaveBeenCalledWith(
				`${TEST_BASE_URL}assignments/1`,
				expect.objectContaining({
					headers: expect.objectContaining({
						'Authorization': `Bearer ${TEST_API_KEY}`,
						'Wanikani-Revision': TEST_API_REVISION
					})
				})
			);

			// Verify the response was processed correctly
			expect(result).toEqual(mockData);
		});

		it('should handle API errors', async () => {
			mockFetch.mockImplementationOnce(async () => ({
				status: 404,
				ok: false,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => ({ error: 'Assignment not found' })
			}));

			await expect(endpoint.get(1)).rejects.toThrow('HTTP error! status: 404');
		});

		it('should handle network errors', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network error'));
			await expect(endpoint.get(1)).rejects.toThrow('Network error');
		});
	});

	describe('start', () => {
		it('should make a request to start an assignment', async () => {
			const mockData = {
				id: 1,
				object: 'assignment',
				subject_id: 123,
				subject_type: 'radical',
				level: 1,
				srs_stage: 1,
				unlocked_at: '2020-01-01T00:00:00.000000Z',
				started_at: '2020-01-02T00:00:00.000000Z',
				passed_at: null,
				available_at: '2020-01-03T00:00:00.000000Z',
				burned_at: null,
				resurrected_at: null,
				hidden: false
			};

			const mockResponse = {
				object: 'assignment',
				url: 'https://api.wanikani.com/v2/assignments/1',
				data_updated_at: '2020-01-01T00:00:00.000000Z',
				data: mockData,
				additional_data: {}
			};

			const startDate = new Date('2020-01-02T00:00:00.000Z');

			mockFetch.mockImplementationOnce(async () => ({
				status: 200,
				ok: true,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => mockResponse
			}));

			const result = await endpoint.start(1, startDate);

			// Verify the request was made correctly
			expect(mockFetch).toHaveBeenCalledWith(
				`${TEST_BASE_URL}assignments/1/start`,
				expect.objectContaining({
					method: 'PUT',
					body: JSON.stringify({ started_at: startDate.toISOString() }),
					headers: expect.objectContaining({
						'Authorization': `Bearer ${TEST_API_KEY}`,
						'Wanikani-Revision': TEST_API_REVISION
					})
				})
			);

			// Verify the response was processed correctly
			expect(result).toEqual(mockData);
		});

		it('should handle API errors', async () => {
			mockFetch.mockImplementationOnce(async () => ({
				status: 400,
				ok: false,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => ({ error: 'Invalid assignment state' })
			}));

			await expect(endpoint.start(1)).rejects.toThrow('HTTP error! status: 400');
		});

		it('should handle network errors', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network error'));
			await expect(endpoint.start(1)).rejects.toThrow('Network error');
		});
	});
}); 