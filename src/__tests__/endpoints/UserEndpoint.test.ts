import { UserEndpoint } from '../../classes/endpoints/UserEndpoint.js';
import { WaniKaniRequest } from '../../classes/WaniKaniRequest.js';
import type { ApiResponse, User, Subscription } from '../../types/wanikani.js';
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
				additional_fields: {
					id: '123',
					username: 'test_user',
					level: 5,
					profile_url: 'https://wanikani.com/users/test_user',
					started_at: '2020-01-01T00:00:00.000000Z',
					current_vacation_started_at: null,
					preferences: {
						default_voice_actor_id: 1,
						lessons_batch_size: 5,
						lessons_autoplay_audio: true,
						reviews_autoplay_audio: true,
						lessons_presentation_order: 'ascending_level_then_subject',
						reviews_presentation_order: 'shuffled',
						extra_study_autoplay_audio: true
					}
				}
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
				default_voice_actor_id: 2,
				lessons_batch_size: 10
			};

			const updateData: Partial<User> = {
				data: {
					subscription: {
						active: true,
						type: 'recurring',
						max_level_granted: 60,
						period_ends_at: '2025-01-01T00:00:00.000000Z'
					},
					additional_fields: {
						preferences
					}
				}
			};

			const mockData = {
				subscription: {
					active: true,
					type: 'recurring',
					max_level_granted: 60,
					period_ends_at: '2025-01-01T00:00:00.000000Z'
				},
				additional_fields: {
					id: '123',
					username: 'test_user',
					preferences: {
						default_voice_actor_id: preferences.default_voice_actor_id,
						lessons_batch_size: preferences.lessons_batch_size,
						lessons_autoplay_audio: true,
						reviews_autoplay_audio: true
					}
				}
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
			expect(result).toEqual(mockData);
		});

		it('should handle update errors', async () => {
			mockFetch.mockImplementationOnce(async () => ({
				status: 400,
				ok: false,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => ({ error: 'Invalid preferences' })
			}));

			const invalidData: Partial<User> = {
				data: {
					subscription: {
						active: true,
						type: 'recurring',
						max_level_granted: 60,
						period_ends_at: '2025-01-01T00:00:00.000000Z'
					},
					additional_fields: {
						preferences: {
							lessons_batch_size: -1
						}
					}
				}
			};

			await expect(endpoint.update(invalidData)).rejects.toThrow('HTTP error! status: 400');
		});
	});
}); 