import type { ApiResponse, Reset } from "../../types/wanikani.js";
import { Endpoint } from "../base/Endpoint.js";

/**
 * Handles level reset-related API endpoints
 * @see {@link https://docs.api.wanikani.com/20170710/#resets Resets API Documentation}
 * @extends {Endpoint}
 */
export class ResetsEndpoint extends Endpoint {
	/**
	 * Gets all level resets
	 * @param {Object} [options] - Optional parameters
	 * @param {Date} [options.updatedAfter] - Only fetch resets created after this date
	 * @returns {Promise<ApiResponse<Reset[]>>} Promise resolving to an array of level resets
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-all-resets Get All Resets API Documentation}
	 * @example
	 * ```typescript
	 * // Get all level resets
	 * const allResets = await api.resets.getAll();
	 * 
	 * // Get resets after a specific date
	 * const recentResets = await api.resets.getAll({
	 *   updatedAfter: new Date('2024-01-01')
	 * });
	 * ```
	 */
	public async getAll(options: { updatedAfter?: Date } = {}): Promise<ApiResponse<Reset[]>> {
		return await this.makeRequest(
			"resets",
			{},
			"resets",
			options.updatedAfter
		);
	}

	/**
	 * Gets a specific level reset by ID
	 * @param {number} id - The reset ID to retrieve
	 * @returns {Promise<Reset>} Promise resolving to the reset data
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-a-specific-reset Get Specific Reset API Documentation}
	 * @example
	 * ```typescript
	 * // Get reset with ID 1234
	 * const reset = await api.resets.get(1234);
	 * ```
	 */
	public async get(id: number): Promise<Reset> {
		return await this.makeRequest(
			`resets/${id}`,
			{},
			"resets"
		);
	}
} 