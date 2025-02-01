import type { ApiResponse, Summary } from "../../types/wanikani.js";
import { Endpoint } from "../base/Endpoint.js";

/**
 * Handles summary-related API endpoints
 * @see {@link https://docs.api.wanikani.com/20170710/#summary Summary API Documentation}
 * @extends {Endpoint}
 */
export class SummaryEndpoint extends Endpoint {
	/**
	 * Gets the current summary of available lessons and reviews
	 * @returns {Promise<ApiResponse<Summary>>} Promise resolving to the summary data
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-a-summary Get Summary API Documentation}
	 * @remarks The summary report changes every hour, so caching is limited to 1 minute
	 * @example
	 * ```typescript
	 * // Get current summary
	 * const summary = await api.summary.get();
	 * 
	 * // Access available lessons and reviews
	 * console.log(`Available lessons: ${summary.data.lessons.length}`);
	 * console.log(`Available reviews: ${summary.data.reviews.length}`);
	 * ```
	 */
	public async get(): Promise<ApiResponse<Summary>> {
		return await this.makeRequest(
			"summary",
			{},
			60 // Cache for 1 minute as this updates frequently
		);
	}
} 