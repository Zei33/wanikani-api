import type { ApiResponse, ReviewStatistic } from "../../types/wanikani.js";
import { Endpoint } from "../base/Endpoint.js";

/**
 * Handles review statistics-related API endpoints
 * @see {@link https://docs.api.wanikani.com/20170710/#review-statistics Review Statistics API Documentation}
 * @extends {Endpoint}
 */
export class ReviewStatisticsEndpoint extends Endpoint {
	/**
	 * Gets all review statistics
	 * @param {Object} [options] - Optional parameters
	 * @param {Date} [options.updatedAfter] - Only fetch statistics updated after this date
	 * @returns {Promise<ApiResponse<ReviewStatistic[]>>} Promise resolving to an array of review statistics
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-all-review-statistics Get All Review Statistics API Documentation}
	 * @example
	 * ```typescript
	 * // Get all review statistics
	 * const allStats = await api.reviewStatistics.getAll();
	 * 
	 * // Get statistics updated after a date
	 * const recentStats = await api.reviewStatistics.getAll({
	 *   updatedAfter: new Date('2024-01-01')
	 * });
	 * ```
	 */
	public async getAll(options: { updatedAfter?: Date } = {}): Promise<ApiResponse<ReviewStatistic[]>> {
		return await this.makeRequest(
			"review_statistics",
			{},
			60 * 60, // Cache for 1 hour as they update moderately often
			options.updatedAfter
		);
	}

	/**
	 * Gets a specific review statistic by ID
	 * @param {number} id - The review statistic ID to retrieve
	 * @returns {Promise<ReviewStatistic>} Promise resolving to the review statistic data
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-a-specific-review-statistic Get Specific Review Statistic API Documentation}
	 * @example
	 * ```typescript
	 * // Get review statistic with ID 1234
	 * const stat = await api.reviewStatistics.get(1234);
	 * ```
	 */
	public async get(id: number): Promise<ReviewStatistic> {
		return await this.makeRequest(
			`review_statistics/${id}`,
			{},
			60 * 60 // Cache for 1 hour
		);
	}
} 