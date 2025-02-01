import type { ApiResponse, Review } from "../../types/wanikani.js";
import { Endpoint } from "../base/Endpoint.js";

/**
 * Handles review-related API endpoints
 * @see {@link https://docs.api.wanikani.com/20170710/#reviews Reviews API Documentation}
 * @extends {Endpoint}
 */
export class ReviewsEndpoint extends Endpoint {
	/**
	 * Gets all reviews
	 * @param {Object} [options] - Optional parameters
	 * @param {Date} [options.updatedAfter] - Only fetch reviews created after this date
	 * @returns {Promise<ApiResponse<Review[]>>} Promise resolving to an array of reviews
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-all-reviews Get All Reviews API Documentation}
	 * @example
	 * ```typescript
	 * // Get all reviews
	 * const allReviews = await api.reviews.getAll();
	 * 
	 * // Get reviews after a specific date
	 * const recentReviews = await api.reviews.getAll({
	 *   updatedAfter: new Date('2024-01-01')
	 * });
	 * ```
	 */
	public async getAll(options: { updatedAfter?: Date } = {}): Promise<ApiResponse<Review[]>> {
		return await this.makeRequest(
			"reviews",
			{},
			24 * 60 * 60, // Cache for 24 hours as reviews never change once recorded
			options.updatedAfter
		);
	}

	/**
	 * Gets a specific review by ID
	 * @param {number} id - The review ID to retrieve
	 * @returns {Promise<Review>} Promise resolving to the review data
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-a-specific-review Get Specific Review API Documentation}
	 * @example
	 * ```typescript
	 * // Get review with ID 1234
	 * const review = await api.reviews.get(1234);
	 * ```
	 */
	public async get(id: number): Promise<Review> {
		return await this.makeRequest(
			`reviews/${id}`,
			{},
			24 * 60 * 60 // Cache for 24 hours
		);
	}

	/**
	 * Creates a new review
	 * @param {Object} data - The review data
	 * @param {number} data.subjectId - The subject ID being reviewed
	 * @param {number} data.incorrectMeaningAnswers - Number of incorrect meaning answers
	 * @param {number} data.incorrectReadingAnswers - Number of incorrect reading answers
	 * @returns {Promise<Review>} Promise resolving to the created review
	 * @see {@link https://docs.api.wanikani.com/20170710/#create-a-review Create Review API Documentation}
	 * @example
	 * ```typescript
	 * // Create a new review
	 * const newReview = await api.reviews.create({
	 *   subjectId: 1234,
	 *   incorrectMeaningAnswers: 1,
	 *   incorrectReadingAnswers: 0
	 * });
	 * ```
	 */
	public async create(data: {
		subjectId: number;
		incorrectMeaningAnswers: number;
		incorrectReadingAnswers: number;
	}): Promise<Review> {
		return await this.makeRequest(
			"reviews",
			{
				method: "POST",
				body: JSON.stringify({
					subject_id: data.subjectId,
					incorrect_meaning_answers: data.incorrectMeaningAnswers,
					incorrect_reading_answers: data.incorrectReadingAnswers
				})
			},
			0 // Don't cache POST requests
		);
	}
} 