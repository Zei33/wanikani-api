import type { User } from "../../types/wanikani.js";
import { Endpoint } from "../base/Endpoint.js";

/** User update request format */
interface UserUpdateRequest {
	user: {
		preferences?: User['preferences'];
	};
}

/**
 * Handles user-related API endpoints
 * @see {@link https://docs.api.wanikani.com/20170710/#user User API Documentation}
 * @extends {Endpoint}
 */
export class UserEndpoint extends Endpoint {
	/**
	 * Gets the user's information
	 * @returns {Promise<User>} Promise resolving to the user data
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-user-information Get User Information API Documentation}
	 * @example
	 * ```typescript
	 * const user = await api.user.get();
	 * console.log(user.subscription.max_level_granted);
	 * ```
	 */
	public async get(): Promise<User> {
		return await this.makeRequest(
			"user",
			{},
			"user"
		);
	}

	/**
	 * Updates the user's information
	 * @param {UserUpdateRequest} data - The data to update
	 * @returns {Promise<User>} Promise resolving to the updated user data
	 * @see {@link https://docs.api.wanikani.com/20170710/#update-user-information Update User Information API Documentation}
	 * @example
	 * ```typescript
	 * const updatedUser = await api.user.update({
	 *   user: {
	 *     preferences: { default_voice_actor_id: 1 }
	 *   }
	 * });
	 * ```
	 */
	public async update(data: UserUpdateRequest): Promise<User> {
		return await this.makeRequest(
			"user",
			{
				method: "PUT",
				body: JSON.stringify(data)
			}
		);
	}
} 