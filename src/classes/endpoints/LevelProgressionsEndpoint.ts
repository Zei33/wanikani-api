import type { ApiResponse, LevelProgression } from "../../types/wanikani.js";
import { Endpoint } from "../base/Endpoint.js";

/**
 * Handles level progression-related API endpoints
 * @see {@link https://docs.api.wanikani.com/20170710/#level-progressions Level Progressions API Documentation}
 * @extends {Endpoint}
 */
export class LevelProgressionsEndpoint extends Endpoint {
	/**
	 * Gets all level progressions
	 * @param {Object} [options] - Optional parameters
	 * @param {Date} [options.updatedAfter] - Only fetch progressions updated after this date
	 * @returns {Promise<ApiResponse<LevelProgression[]>>} Promise resolving to an array of level progressions
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-all-level-progressions Get All Level Progressions API Documentation}
	 * @remarks Some users may not have a full history as logging was implemented late in the application's life
	 * @example
	 * ```typescript
	 * // Get all level progressions
	 * const allProgressions = await api.levelProgressions.getAll();
	 * 
	 * // Get progressions updated after a date
	 * const recentProgressions = await api.levelProgressions.getAll({
	 *   updatedAfter: new Date('2024-01-01')
	 * });
	 * ```
	 */
	public async getAll(options: { updatedAfter?: Date } = {}): Promise<ApiResponse<LevelProgression[]>> {
		return await this.makeRequest(
			"level_progressions",
			{},
			60 * 60, // Cache for 1 hour as they update when levels change
			options.updatedAfter
		);
	}

	/**
	 * Gets a specific level progression by ID
	 * @param {number} id - The level progression ID to retrieve
	 * @returns {Promise<LevelProgression>} Promise resolving to the level progression data
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-a-specific-level-progression Get Specific Level Progression API Documentation}
	 * @example
	 * ```typescript
	 * // Get level progression with ID 1234
	 * const progression = await api.levelProgressions.get(1234);
	 * ```
	 */
	public async get(id: number): Promise<LevelProgression> {
		return await this.makeRequest(
			`level_progressions/${id}`,
			{},
			60 * 60 // Cache for 1 hour
		);
	}
} 