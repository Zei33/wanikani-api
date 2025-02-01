import type { CommonTimestamps } from "./base.js";

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
export interface User extends CommonTimestamps {
	/** The user's subscription information */
	subscription: Subscription | null;
	/** The user's current level */
	level: number;
	/** When the user started their vacation, if any */
	current_vacation_started_at: string | null;
	/** User preferences */
	preferences: {
		default_voice_actor_id: number;
		lessons_autoplay_audio: boolean;
		lessons_batch_size: number;
		lessons_presentation_order: string;
		reviews_autoplay_audio: boolean;
		reviews_display_srs_indicator: boolean;
	};
} 