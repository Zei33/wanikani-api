import { UserEndpoint } from '../../classes/endpoints/UserEndpoint.js';
import { WaniKaniRequest } from '../../classes/WaniKaniRequest.js';
import type { User } from '../../types/wanikani.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_KEY = process.env.WANIKANI_API_KEY;
const BASE_URL = 'https://api.wanikani.com/v2/';
const API_REVISION = '20170710';
const CACHE_DIR = '/tmp/wanikani-cache';

// Skip all tests if no API key is provided
if (!API_KEY) {
	describe('UserEndpoint Live Tests', () => {
		it('should skip all tests when no API key is provided', () => {
			console.warn('Skipping live tests: No API key provided');
		});
	});
} else {
	describe('UserEndpoint Live Tests', () => {
		const request = new WaniKaniRequest(API_KEY, BASE_URL, API_REVISION, CACHE_DIR);
		const endpoint = new UserEndpoint(request);

		describe('get', () => {
			it('should fetch the current user', async () => {
				const response = await endpoint.get();
				
				// Basic structure checks
				expect(response).toBeDefined();
				expect(response.level).toBeGreaterThan(0);
				expect(response.current_vacation_started_at).toBeDefined();
				expect(response.subscription).not.toBeNull();
				const subscription = response.subscription!;
				expect(subscription.active).toBeDefined();
				expect(subscription.type).toBeDefined();
				expect(subscription.max_level_granted).toBeGreaterThan(0);
				expect(response.preferences).toBeDefined();
				expect(typeof response.preferences.default_voice_actor_id).toBe('number');
			});
		});

		describe('update', () => {
			it('should update user preferences and restore original values', async () => {
				// Get original preferences
				const originalResponse = await endpoint.get();
				const originalPreferences = originalResponse.preferences;

				// Make the update
				const updateData = {
					user: {
						preferences: {
							default_voice_actor_id: 1,
							lessons_autoplay_audio: false,
							lessons_batch_size: 5,
							lessons_presentation_order: 'ascending_level_then_subject',
							reviews_autoplay_audio: false,
							reviews_display_srs_indicator: true
						}
					}
				};

				// Update to new preferences
				const updatedResponse = await endpoint.update(updateData);
				
				// Verify the update worked
				expect(updatedResponse.preferences.default_voice_actor_id).toBe(1);
				expect(updatedResponse.preferences.lessons_autoplay_audio).toBe(false);
				expect(updatedResponse.preferences.lessons_batch_size).toBe(5);

				// Restore original preferences
				const restoreData = {
					user: {
						preferences: originalPreferences
					}
				};
				const restoredResponse = await endpoint.update(restoreData);

				// Verify restoration worked
				expect(restoredResponse.preferences).toEqual(originalPreferences);
			});
		});
	});
} 