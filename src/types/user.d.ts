import type { ApiResponse } from "./base.js";

/**
 * Represents a user's subscription status on WaniKani
 */
export interface Subscription {
	/** Whether the subscription is currently active */
	active: boolean;
	/** The type of subscription */
	type: 'free' | 'recurring' | 'lifetime' | 'unknown';
	/** The maximum level the user can access */
	max_level_granted: number;
	/** When the subscription period ends (null for lifetime subscriptions) */
	period_ends_at: string | null;
}

/**
 * Represents a WaniKani user's data
 */
export interface User extends ApiResponse<{
	/** The user's subscription information */
	subscription: Subscription;
	/** Additional user fields */
	additional_fields: Record<string, unknown>;
}> {} 