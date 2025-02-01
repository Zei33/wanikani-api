import type { ApiResponse, User } from "../../types/wanikani.js";
import { Endpoint } from "../base/Endpoint.js";

/**
 * Handles user-related API endpoints
 * @see {@link https://docs.api.wanikani.com/20170710/#user User API Documentation}
 * @extends {Endpoint}
 */
export class UserEndpoint extends Endpoint {
	/**
	 * Gets the user's information
	 * @returns {Promise<ApiResponse<User>>} Promise resolving to the user data
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-user-information Get User Information API Documentation}
	 * @example
	 * ```typescript
	 * const user = await api.user.get();
	 * console.log(user.data.subscription.max_level_granted);
	 * ```
	 */
	public async get(): Promise<ApiResponse<User>> {
		return await this.makeRequest(
			"user",
			{},
			60 * 60 // Cache for 1 hour as user data doesn't change often
		);
	}

	/**
	 * Updates the user's information
	 * @param {Partial<User>} data - The data to update
	 * @returns {Promise<ApiResponse<User>>} Promise resolving to the updated user data
	 * @see {@link https://docs.api.wanikani.com/20170710/#update-user-information Update User Information API Documentation}
	 * @example
	 * ```typescript
	 * const updatedUser = await api.user.update({
	 *   preferences: { default_voice_actor_id: 1 }
	 * });
	 * ```
	 */
	public async update(data: Partial<User>): Promise<ApiResponse<User>> {
		return await this.makeRequest(
			"user",
			{
				method: "PUT",
				body: JSON.stringify(data)
			},
			0 // Don't cache PUT requests
		);
	}
} 