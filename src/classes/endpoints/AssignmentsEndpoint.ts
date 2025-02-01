import type { ApiResponse, Assignment } from "../../types/wanikani.js";
import { Endpoint } from "../base/Endpoint.js";

/**
 * Handles assignment-related API endpoints
 * @see {@link https://docs.api.wanikani.com/20170710/#assignments Assignments API Documentation}
 * @extends {Endpoint}
 */
export class AssignmentsEndpoint extends Endpoint {
	/**
	 * Gets all assignments
	 * @param {Object} [options] - Optional parameters
	 * @param {Date} [options.updatedAfter] - Only fetch assignments updated after this date
	 * @returns {Promise<ApiResponse<Assignment[]>>} Promise resolving to an array of assignments
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-all-assignments Get All Assignments API Documentation}
	 * @example
	 * ```typescript
	 * // Get all assignments
	 * const allAssignments = await api.assignments.getAll();
	 * 
	 * // Get assignments updated after a date
	 * const recentAssignments = await api.assignments.getAll({
	 *   updatedAfter: new Date('2024-01-01')
	 * });
	 * ```
	 */
	public async getAll(options: { updatedAfter?: Date } = {}): Promise<ApiResponse<Assignment[]>> {
		return await this.makeRequest(
			"assignments",
			{},
			"assignments",
			options.updatedAfter
		);
	}

	/**
	 * Gets a specific assignment by ID
	 * @param {number} id - The assignment ID to retrieve
	 * @returns {Promise<Assignment>} Promise resolving to the assignment data
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-a-specific-assignment Get Specific Assignment API Documentation}
	 * @example
	 * ```typescript
	 * // Get assignment with ID 1234
	 * const assignment = await api.assignments.get(1234);
	 * ```
	 */
	public async get(id: number): Promise<Assignment> {
		return await this.makeRequest(
			`assignments/${id}`,
			{},
			"assignments"
		);
	}

	/**
	 * Starts an assignment
	 * @param {number} id - The assignment ID to start
	 * @param {Date} [startedAt=new Date()] - When the assignment was started
	 * @returns {Promise<Assignment>} Promise resolving to the updated assignment data
	 * @see {@link https://docs.api.wanikani.com/20170710/#start-an-assignment Start Assignment API Documentation}
	 * @example
	 * ```typescript
	 * // Start an assignment
	 * const startedAssignment = await api.assignments.start(1234);
	 * 
	 * // Start an assignment with a specific start time
	 * const startedAssignment = await api.assignments.start(1234, new Date('2024-01-01'));
	 * ```
	 */
	public async start(id: number, startedAt: Date = new Date()): Promise<Assignment> {
		return await this.makeRequest(
			`assignments/${id}/start`,
			{
				method: "PUT",
				body: JSON.stringify({ started_at: startedAt.toISOString() })
			}
		);
	}
} 