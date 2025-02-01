import { StudyMaterialsEndpoint } from '../../classes/endpoints/StudyMaterialsEndpoint.js';
import { WaniKaniRequest } from '../../classes/WaniKaniRequest.js';
import type { ApiResponse, StudyMaterial } from '../../types/wanikani.js';
import fs from 'fs/promises';

// Mock fs/promises
jest.mock('fs/promises');
const mockFs = jest.mocked(fs);

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('StudyMaterialsEndpoint', () => {
	const TEST_API_KEY = 'test-api-key';
	const TEST_BASE_URL = 'https://api.wanikani.com/v2/';
	const TEST_API_REVISION = '20170710';
	const TEST_CACHE_DIR = '/tmp/wanikani-cache';
	let request: WaniKaniRequest;
	let endpoint: StudyMaterialsEndpoint;

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
		endpoint = new StudyMaterialsEndpoint(request);
	});

	describe('getAll', () => {
		it('should make a request to get all study materials', async () => {
			const mockData = [{
				id: 1,
				subject_id: 123,
				meaning_note: 'Remember this as...',
				reading_note: 'Sounds like...',
				meaning_synonyms: ['alternative', 'meaning'],
				hidden: false,
				created_at: '2020-01-01T00:00:00.000000Z',
				updated_at: '2020-01-01T00:00:00.000000Z'
			}];

			const mockResponse = {
				object: 'collection',
				url: 'https://api.wanikani.com/v2/study_materials',
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
				`${TEST_BASE_URL}study_materials`,
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
		it('should make a request to get a specific study material', async () => {
			const mockData = {
				id: 1,
				subject_id: 123,
				meaning_note: 'Remember this as...',
				reading_note: 'Sounds like...',
				meaning_synonyms: ['alternative', 'meaning'],
				hidden: false,
				created_at: '2020-01-01T00:00:00.000000Z',
				updated_at: '2020-01-01T00:00:00.000000Z'
			};

			const mockResponse = {
				object: 'study_material',
				url: 'https://api.wanikani.com/v2/study_materials/1',
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
				`${TEST_BASE_URL}study_materials/1`,
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
				json: async () => ({ error: 'Study material not found' })
			}));

			await expect(endpoint.get(1)).rejects.toThrow('HTTP error! status: 404');
		});

		it('should handle network errors', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network error'));
			await expect(endpoint.get(1)).rejects.toThrow('Network error');
		});
	});

	describe('create', () => {
		it('should make a request to create a study material', async () => {
			const studyMaterial: StudyMaterial = {
				id: 1,
				subject_id: 123,
				meaning_note: 'Remember this as...',
				reading_note: 'Sounds like...',
				meaning_synonyms: ['alternative', 'meaning'],
				hidden: false,
				created_at: '2020-01-01T00:00:00.000000Z',
				updated_at: '2020-01-01T00:00:00.000000Z'
			};

			const mockResponse = {
				object: 'study_material',
				url: 'https://api.wanikani.com/v2/study_materials',
				data_updated_at: '2020-01-01T00:00:00.000000Z',
				data: studyMaterial,
				additional_data: {}
			};

			mockFetch.mockImplementationOnce(async () => ({
				status: 200,
				ok: true,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => mockResponse
			}));

			const result = await endpoint.create(studyMaterial);

			// Verify the request was made correctly
			expect(mockFetch).toHaveBeenCalledWith(
				`${TEST_BASE_URL}study_materials`,
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(studyMaterial),
					headers: expect.objectContaining({
						'Authorization': `Bearer ${TEST_API_KEY}`,
						'Wanikani-Revision': TEST_API_REVISION
					})
				})
			);

			// Verify the response was processed correctly
			expect(result).toEqual(studyMaterial);
		});

		it('should handle API errors', async () => {
			mockFetch.mockImplementationOnce(async () => ({
				status: 400,
				ok: false,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => ({ error: 'Invalid study material data' })
			}));

			const invalidData: StudyMaterial = {
				id: -1,
				subject_id: -1,
				meaning_note: null,
				reading_note: null,
				meaning_synonyms: [],
				hidden: false,
				created_at: 'invalid-date',
				updated_at: 'invalid-date'
			};

			await expect(endpoint.create(invalidData)).rejects.toThrow('HTTP error! status: 400');
		});

		it('should handle network errors', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network error'));
			const studyMaterial: StudyMaterial = {
				id: 1,
				subject_id: 123,
				meaning_note: 'Remember this as...',
				reading_note: 'Sounds like...',
				meaning_synonyms: ['alternative', 'meaning'],
				hidden: false,
				created_at: '2020-01-01T00:00:00.000000Z',
				updated_at: '2020-01-01T00:00:00.000000Z'
			};
			await expect(endpoint.create(studyMaterial)).rejects.toThrow('Network error');
		});
	});

	describe('update', () => {
		it('should make a request to update a study material', async () => {
			const updateData: Partial<StudyMaterial> = {
				meaning_note: 'Updated meaning note',
				meaning_synonyms: ['new', 'synonyms']
			};

			const mockData = {
				id: 1,
				subject_id: 123,
				meaning_note: 'Updated meaning note',
				reading_note: 'Sounds like...',
				meaning_synonyms: ['new', 'synonyms'],
				hidden: false,
				created_at: '2020-01-01T00:00:00.000000Z',
				updated_at: '2020-01-02T00:00:00.000000Z'
			};

			const mockResponse = {
				object: 'study_material',
				url: 'https://api.wanikani.com/v2/study_materials/1',
				data_updated_at: '2020-01-02T00:00:00.000000Z',
				data: mockData,
				additional_data: {}
			};

			mockFetch.mockImplementationOnce(async () => ({
				status: 200,
				ok: true,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => mockResponse
			}));

			const result = await endpoint.update(1, updateData);

			// Verify the request was made correctly
			expect(mockFetch).toHaveBeenCalledWith(
				`${TEST_BASE_URL}study_materials/1`,
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

		it('should handle API errors', async () => {
			mockFetch.mockImplementationOnce(async () => ({
				status: 400,
				ok: false,
				headers: new Map([['Content-Type', 'application/json']]) as unknown as Headers,
				json: async () => ({ error: 'Invalid update data' })
			}));

			const invalidData: Partial<StudyMaterial> = {
				meaning_note: ''
			};

			await expect(endpoint.update(1, invalidData)).rejects.toThrow('HTTP error! status: 400');
		});

		it('should handle network errors', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network error'));
			const updateData: Partial<StudyMaterial> = {
				meaning_note: 'Updated meaning note'
			};
			await expect(endpoint.update(1, updateData)).rejects.toThrow('Network error');
		});
	});
}); 