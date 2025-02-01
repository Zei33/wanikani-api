import type { ApiResponse, Subject } from "../../types/wanikani.js";
import { Endpoint } from "../base/Endpoint.js";

/**
 * Handles subject-related API endpoints (radicals, kanji, vocabulary)
 * @see {@link https://docs.api.wanikani.com/20170710/#subjects Subjects API Documentation}
 * @extends {Endpoint}
 */
export class SubjectsEndpoint extends Endpoint {
	/**
	 * Gets all subjects (radicals, kanji, vocabulary)
	 * @param {Object} [options] - Optional parameters
	 * @param {Date} [options.updatedAfter] - Only fetch subjects updated after this date
	 * @returns {Promise<ApiResponse<Subject[]>>} Promise resolving to an array of subjects
	 * @example
	 * ```typescript
	 * // Get all subjects
	 * const allSubjects = await api.subjects.getAll();
	 * 
	 * // Get subjects updated after a date
	 * const recentSubjects = await api.subjects.getAll({ 
	 *   updatedAfter: new Date('2024-01-01') 
	 * });
	 * ```
	 */
	public async getAll(options: { updatedAfter?: Date } = {}): Promise<ApiResponse<Subject[]>> {
		return await this.makeRequest(
			"subjects",
			{},
			24 * 60 * 60, // Cache for 24 hours as subjects rarely change
			options.updatedAfter
		);
	}

	/**
	 * Gets a specific subject by ID
	 * @param {number} id - The subject ID to retrieve
	 * @returns {Promise<Subject>} Promise resolving to the subject data
	 * @example
	 * ```typescript
	 * // Get subject with ID 1234
	 * const subject = await api.subjects.get(1234);
	 * ```
	 */
	public async get(id: number): Promise<Subject> {
		return await this.makeRequest(
			`subjects/${id}`,
			{},
			24 * 60 * 60 // Cache for 24 hours
		);
	}
} 