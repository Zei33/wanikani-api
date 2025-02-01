import { ReviewsEndpoint } from '../../classes/endpoints/ReviewsEndpoint.js';
import { WaniKaniRequest } from '../../classes/WaniKaniRequest.js';
import type { ApiResponse, Review } from '../../types/wanikani.js';
import fs from 'fs/promises';

// Mock fs/promises
jest.mock('fs/promises');
const mockFs = jest.mocked(fs);

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ReviewsEndpoint', () => {
	const TEST_API_KEY = 'test-api-key';
	const TEST_BASE_URL = 'https://api.wanikani.com/v2/';
	const TEST_API_REVISION = '20170710';
	const TEST_CACHE_DIR = '/tmp/wanikani-cache';
	let request: WaniKaniRequest;
	let endpoint: ReviewsEndpoint;

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
		endpoint = new ReviewsEndpoint(request);
	});

	describe('getAll', () => {
		it('should make a request to get all reviews', async () => {
			const mockData = [{
				id: 1,
				object: 'review',
				subject_id: 123,
				subject_type: 'radical',
				starting_srs_stage: 1,
				ending_srs_stage: 2,
				incorrect_meaning_answers: 0,
				incorrect_reading_answers: 1,
				created_at: '2020-01-01T00:00:00.000000Z',
				assignment_id: 456,
				spaced_repetition_system_id: 1
			}];

			const mockResponse = {
				object: 'collection',
				url: 'https://api.wanikani.com/v2/reviews',
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
				`${TEST_BASE_URL}reviews`,
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
		it('should make a request to get a specific review', async () => {
			const mockData = {
				id: 1,
				object: 'review',
				subject_id: 123,
				subject_type: 'radical',
				starting_srs_stage: 1,
				ending_srs_stage: 2,
				incorrect_meaning_answers: 0,
				incorrect_reading_answers: 1,
				created_at: '2020-01-01T00:00:00.000000Z',
				assignment_id: 456,
				spaced_repetition_system_id: 1
			};

			const mockResponse = {
				object: 'review',
				url: 'https://api.wanikani.com/v2/reviews/1',
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
				`${TEST_BASE_URL}reviews/1`,
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
				json: async () => ({ error: 'Review not found' })
			}));

			await expect(endpoint.get(1)).rejects.toThrow('HTTP error! status: 404');
		});

		it('should handle network errors', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network error'));
			await expect(endpoint.get(1)).rejects.toThrow('Network error');
		});
	});

	describe('create', () => {
		it('should make a request to create a review', async () => {
			const reviewData: Review = {
				id: 1,
				subject_id: 123,
				incorrect_meaning_answers: 0,
				incorrect_reading_answers: 1,
				started_at: '2020-01-01T00:00:00.000000Z',
				created_at: '2020-01-01T00:00:00.000000Z',
				updated_at: '2020-01-01T00:00:00.000000Z'
			};

			const mockResponse = {
				object: 'review',
				url: 'https://api.wanikani.com/v2/reviews',
				data_updated_at: '2020-01-01T00:00:00.000000Z',
				data: reviewData,
				additional_data: {}
			};

			mockFetch.mockImplementationOnce(async () => ({
				status: 200,
				ok: true,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => mockResponse
			}));

			const result = await endpoint.create(reviewData);

			// Verify the request was made correctly
			expect(mockFetch).toHaveBeenCalledWith(
				`${TEST_BASE_URL}reviews`,
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(reviewData),
					headers: expect.objectContaining({
						'Authorization': `Bearer ${TEST_API_KEY}`,
						'Wanikani-Revision': TEST_API_REVISION
					})
				})
			);

			// Verify the response was processed correctly
			expect(result).toEqual(reviewData);
		});

		it('should handle API errors', async () => {
			mockFetch.mockImplementationOnce(async () => ({
				status: 400,
				ok: false,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => ({ error: 'Invalid review data' })
			}));

			const invalidData: Review = {
				id: -1,
				subject_id: -1,
				incorrect_meaning_answers: -1,
				incorrect_reading_answers: -1,
				started_at: 'invalid-date',
				created_at: 'invalid-date',
				updated_at: 'invalid-date'
			};

			await expect(endpoint.create(invalidData)).rejects.toThrow('HTTP error! status: 400');
		});

		it('should handle network errors', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network error'));
			const reviewData: Review = {
				id: 1,
				subject_id: 123,
				incorrect_meaning_answers: 0,
				incorrect_reading_answers: 0,
				started_at: '2020-01-01T00:00:00.000000Z',
				created_at: '2020-01-01T00:00:00.000000Z',
				updated_at: '2020-01-01T00:00:00.000000Z'
			};
			await expect(endpoint.create(reviewData)).rejects.toThrow('Network error');
		});
	});
}); 