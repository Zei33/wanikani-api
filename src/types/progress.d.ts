import type { CommonTimestamps } from "./base.js";

/**
 * Represents a user's level progression
 */
export interface LevelProgression extends CommonTimestamps {
	/** The level this progression is for */
	level: number;
	/** When the user started this level */
	started_at: string | null;
	/** When the user passed at least 90% of assignments at this level */
	passed_at: string | null;
	/** When the user completed all assignments at this level */
	completed_at: string | null;
	/** When the user abandoned the level (usually due to a reset) */
	abandoned_at: string | null;
	/** When this progression was unlocked */
	unlocked_at: string | null;
}

/**
 * Represents a user's level reset
 */
export interface Reset extends CommonTimestamps {
	/** The reset's unique ID */
	id: number;
	/** The original level before reset */
	original_level: number;
	/** The target level to reset to */
	target_level: number;
	/** When the reset was confirmed */
	confirmed_at: string | null;
}

/**
 * Represents a summary of available lessons and reviews
 */
export interface Summary {
	/** Available lessons */
	lessons: Array<{
		/** When these lessons become available */
		available_at: string;
		/** IDs of subjects available for lessons */
		subject_ids: number[];
	}>;
	/** Available reviews */
	reviews: Array<{
		/** When these reviews become available */
		available_at: string;
		/** IDs of subjects available for review */
		subject_ids: number[];
	}>;
	/** Next review date */
	next_reviews_at: string | null;
} 