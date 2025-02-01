import { UserEndpoint } from '../../classes/endpoints/UserEndpoint.js';
import { WaniKaniRequest } from '../../classes/WaniKaniRequest.js';
import type { User } from '../../types/wanikani.js';
import fs from 'fs/promises';

// Mock fs/promises
jest.mock('fs/promises');
const mockFs = jest.mocked(fs);

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('UserEndpoint', () => {
	const TEST_API_KEY = 'test-api-key';
	const TEST_BASE_URL = 'https://api.wanikani.com/v2/';
	const TEST_API_REVISION = '20170710';
	const TEST_CACHE_DIR = '/tmp/wanikani-cache';
	let request: WaniKaniRequest;
	let endpoint: UserEndpoint;

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
		endpoint = new UserEndpoint(request);
	});

	describe('get', () => {
		it('should make a request to the user endpoint', async () => {
			const mockData = {
				subscription: {
					active: true,
					type: 'recurring',
					max_level_granted: 60,
					period_ends_at: '2025-01-01T00:00:00.000000Z'
				},
				level: 5,
				current_vacation_started_at: null,
				preferences: {
					default_voice_actor_id: 1,
					lessons_batch_size: 5,
					lessons_autoplay_audio: true,
					reviews_autoplay_audio: true,
					lessons_presentation_order: 'ascending_level_then_subject',
					reviews_presentation_order: 'shuffled',
					extra_study_autoplay_audio: true
				},
				created_at: '2020-01-01T00:00:00.000000Z',
				updated_at: '2020-01-01T00:00:00.000000Z'
			};

			const mockResponse = {
				object: 'user',
				url: 'https://api.wanikani.com/v2/user',
				data: mockData,
				additional_data: {}
			};

			mockFetch.mockImplementationOnce(async () => ({
				status: 200,
				ok: true,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => mockResponse
			}));

			const result = await endpoint.get();

			// Verify the request was made correctly
			expect(mockFetch).toHaveBeenCalledWith(
				`${TEST_BASE_URL}user`,
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

			await expect(endpoint.get()).rejects.toThrow('HTTP error! status: 401');
		});

		it('should handle network errors', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network error'));
			await expect(endpoint.get()).rejects.toThrow('Network error');
		});
	});

	describe('update', () => {
		it('should update user preferences', async () => {
			const preferences = {
				default_voice_actor_id: 1,
				lessons_autoplay_audio: false,
				lessons_batch_size: 5,
				lessons_presentation_order: 'ascending_level_then_subject',
				reviews_autoplay_audio: false,
				reviews_display_srs_indicator: true
			} as const;

			const updateData = {
				user: {
					preferences
				}
			};

			const mockResponse = {
				object: 'user',
				url: 'https://api.wanikani.com/v2/user',
				data_updated_at: '2024-01-01T00:00:00.000000Z',
				data: {
					id: 'test-user',
					subscription: {
						active: true,
						type: 'recurring' as const,
						max_level_granted: 60,
						period_ends_at: '2024-12-31T23:59:59.000000Z'
					},
					preferences,
					level: 1,
					current_vacation_started_at: null,
					created_at: '2024-01-01T00:00:00.000000Z',
					updated_at: '2024-01-01T00:00:00.000000Z'
				}
			};

			mockFetch.mockImplementationOnce(async () => ({
				status: 200,
				ok: true,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => mockResponse
			}));

			const result = await endpoint.update(updateData);

			// Verify the request was made correctly
			expect(mockFetch).toHaveBeenCalledWith(
				`${TEST_BASE_URL}user`,
				expect.objectContaining({
					method: 'PUT',
					body: JSON.stringify(updateData),
					headers: expect.objectContaining({
						'Authorization': `Bearer ${TEST_API_KEY}`,
						'Wanikani-Revision': TEST_API_REVISION
					})
				})
			);

			// Verify the response was processed correctly
			expect(result).toEqual(mockResponse.data);
		});

		it('should handle update errors', async () => {
			mockFetch.mockImplementationOnce(async () => ({
				status: 400,
				ok: false,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => ({ error: 'Invalid preferences' })
			}));

			const invalidData = {
				user: {
					preferences: {
						default_voice_actor_id: -1,
						lessons_autoplay_audio: false,
						lessons_batch_size: -5,
						lessons_presentation_order: 'invalid_order',
						reviews_autoplay_audio: false,
						reviews_display_srs_indicator: false
					}
				}
			};

			await expect(endpoint.update(invalidData)).rejects.toThrow('HTTP error! status: 400');
		});
	});
}); 