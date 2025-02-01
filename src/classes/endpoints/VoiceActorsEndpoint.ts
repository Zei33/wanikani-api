import type { ApiResponse, VoiceActor } from "../../types/wanikani.js";
import { Endpoint } from "../base/Endpoint.js";

/**
 * Handles voice actor-related API endpoints
 * @see {@link https://docs.api.wanikani.com/20170710/#voice-actors Voice Actors API Documentation}
 * @extends {Endpoint}
 */
export class VoiceActorsEndpoint extends Endpoint {
	/**
	 * Gets all voice actors
	 * @param {Object} [options] - Optional parameters
	 * @param {Date} [options.updatedAfter] - Only fetch voice actors updated after this date
	 * @returns {Promise<ApiResponse<VoiceActor[]>>} Promise resolving to an array of voice actors
	 * @remarks Voice actors rarely change as they are a permanent part of the system
	 * @example
	 * ```typescript
	 * // Get all voice actors
	 * const allActors = await api.voiceActors.getAll();
	 * 
	 * // Get voice actors updated after a date
	 * const recentActors = await api.voiceActors.getAll({
	 *   updatedAfter: new Date('2024-01-01')
	 * });
	 * ```
	 */
	public async getAll(options: { updatedAfter?: Date } = {}): Promise<ApiResponse<VoiceActor[]>> {
		return await this.makeRequest(
			"voice_actors",
			{},
			24 * 60 * 60, // Cache for 24 hours as voice actors rarely change
			options.updatedAfter
		);
	}

	/**
	 * Gets a specific voice actor by ID
	 * @param {number} id - The voice actor ID to retrieve
	 * @returns {Promise<VoiceActor>} Promise resolving to the voice actor data
	 * @example
	 * ```typescript
	 * // Get voice actor with ID 1234
	 * const actor = await api.voiceActors.get(1234);
	 * ```
	 */
	public async get(id: number): Promise<VoiceActor> {
		return await this.makeRequest(
			`voice_actors/${id}`,
			{},
			24 * 60 * 60 // Cache for 24 hours
		);
	}
} 