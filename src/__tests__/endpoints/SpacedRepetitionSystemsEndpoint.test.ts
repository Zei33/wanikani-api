import { SpacedRepetitionSystemsEndpoint } from '../../classes/endpoints/SpacedRepetitionSystemsEndpoint.js';
import { WaniKaniRequest } from '../../classes/WaniKaniRequest.js';
import type { ApiResponse, Srs } from '../../types/wanikani.js';
import fs from 'fs/promises';

// Mock fs/promises
jest.mock('fs/promises');
const mockFs = jest.mocked(fs);

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('SpacedRepetitionSystemsEndpoint', () => {
	const TEST_API_KEY = 'test-api-key';
	const TEST_BASE_URL = 'https://api.wanikani.com/v2/';
	const TEST_API_REVISION = '20170710';
	const TEST_CACHE_DIR = '/tmp/wanikani-cache';
	let request: WaniKaniRequest;
	let endpoint: SpacedRepetitionSystemsEndpoint;

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
		endpoint = new SpacedRepetitionSystemsEndpoint(request);
	});

	describe('getAll', () => {
		it('should make a request to get all SRS systems', async () => {
			const mockData = [{
				id: 1,
				name: 'Default SRS',
				description: 'The default spaced repetition system',
				unlocking_stage_position: 0,
				starting_stage_position: 1,
				passing_stage_position: 5,
				burning_stage_position: 9,
				stages: [
					{
						position: 0,
						name: 'Initiate',
						interval: null,
						interval_unit: null,
						reviews_required: 1
					},
					{
						position: 1,
						name: 'Apprentice',
						interval: 4,
						interval_unit: 'hours',
						reviews_required: 2
					}
				],
				created_at: '2020-01-01T00:00:00.000000Z',
				updated_at: '2020-01-01T00:00:00.000000Z'
			}];

			const mockResponse = {
				object: 'collection',
				url: 'https://api.wanikani.com/v2/spaced_repetition_systems',
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
				`${TEST_BASE_URL}spaced_repetition_systems`,
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
		it('should make a request to get a specific SRS system', async () => {
			const mockData = {
				id: 1,
				name: 'Default SRS',
				description: 'The default spaced repetition system',
				unlocking_stage_position: 0,
				starting_stage_position: 1,
				passing_stage_position: 5,
				burning_stage_position: 9,
				stages: [
					{
						position: 0,
						name: 'Initiate',
						interval: null,
						interval_unit: null,
						reviews_required: 1
					},
					{
						position: 1,
						name: 'Apprentice',
						interval: 4,
						interval_unit: 'hours',
						reviews_required: 2
					}
				],
				created_at: '2020-01-01T00:00:00.000000Z',
				updated_at: '2020-01-01T00:00:00.000000Z'
			};

			const mockResponse = {
				object: 'spaced_repetition_system',
				url: 'https://api.wanikani.com/v2/spaced_repetition_systems/1',
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
				`${TEST_BASE_URL}spaced_repetition_systems/1`,
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
				json: async () => ({ error: 'SRS system not found' })
			}));

			await expect(endpoint.get(1)).rejects.toThrow('HTTP error! status: 404');
		});

		it('should handle network errors', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network error'));
			await expect(endpoint.get(1)).rejects.toThrow('Network error');
		});
	});
}); 