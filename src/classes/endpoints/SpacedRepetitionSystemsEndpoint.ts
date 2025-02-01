import type { ApiResponse, Srs } from "../../types/wanikani.js";
import { Endpoint } from "../base/Endpoint.js";

/**
 * Handles spaced repetition system-related API endpoints
 * @see {@link https://docs.api.wanikani.com/20170710/#spaced-repetition-systems Spaced Repetition Systems API Documentation}
 * @extends {Endpoint}
 */
export class SpacedRepetitionSystemsEndpoint extends Endpoint {
	/**
	 * Gets all spaced repetition systems
	 * @param {Object} [options] - Optional parameters
	 * @param {Date} [options.updatedAfter] - Only fetch systems updated after this date
	 * @returns {Promise<ApiResponse<Srs[]>>} Promise resolving to an array of SRS systems
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-all-spaced-repetition-systems Get All SRS Systems API Documentation}
	 * @example
	 * ```typescript
	 * // Get all SRS systems
	 * const allSystems = await api.spacedRepetitionSystems.getAll();
	 * 
	 * // Get systems updated after a date
	 * const recentSystems = await api.spacedRepetitionSystems.getAll({
	 *   updatedAfter: new Date('2024-01-01')
	 * });
	 * ```
	 */
	public async getAll(options: { updatedAfter?: Date } = {}): Promise<ApiResponse<Srs[]>> {
		return await this.makeRequest(
			"spaced_repetition_systems",
			{},
			"srs",
			options.updatedAfter
		);
	}

	/**
	 * Gets a specific spaced repetition system by ID
	 * @param {number} id - The SRS system ID to retrieve
	 * @returns {Promise<Srs>} Promise resolving to the SRS system data
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-a-specific-spaced-repetition-system Get Specific SRS System API Documentation}
	 * @example
	 * ```typescript
	 * // Get SRS system with ID 1234
	 * const system = await api.spacedRepetitionSystems.get(1234);
	 * ```
	 */
	public async get(id: number): Promise<Srs> {
		return await this.makeRequest(
			`spaced_repetition_systems/${id}`,
			{},
			"srs"
		);
	}
} 