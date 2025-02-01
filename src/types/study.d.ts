import type { CommonTimestamps } from "./base.js";

/**
 * Represents a WaniKani subject (radicals, kanji, or vocabulary)
 */
export interface Subject extends CommonTimestamps {
	/** The subject's unique ID */
	id: number;
	/** The type of subject (radical, kanji, vocabulary) */
	object: 'radical' | 'kanji' | 'vocabulary';
	/** The subject's level in WaniKani */
	level: number;
	/** The subject's meanings */
	meanings: Array<{
		meaning: string;
		primary: boolean;
		accepted_answer: boolean;
	}>;
	/** Additional subject fields */
	additional_fields: Record<string, unknown>;
}

/**
 * Represents a WaniKani assignment (user's progress on a subject)
 */
export interface Assignment extends CommonTimestamps {
	/** The assignment's unique ID */
	id: number;
	/** The subject this assignment is for */
	subject_id: number;
	/** The subject type */
	subject_type: 'radical' | 'kanji' | 'vocabulary';
	/** Current SRS stage (0-9) */
	srs_stage: number;
	/** When the assignment was started */
	started_at: string | null;
	/** When the assignment was passed */
	passed_at: string | null;
	/** When the assignment was burned */
	burned_at: string | null;
	/** When the assignment is available for review */
	available_at: string | null;
	/** When the assignment was resurrected from burned state */
	resurrected_at: string | null;
}

/**
 * Represents statistics about a user's reviews
 */
export interface ReviewStatistic extends CommonTimestamps {
	/** The statistic's unique ID */
	id: number;
	/** The subject this statistic is for */
	subject_id: number;
	/** The subject type */
	subject_type: 'radical' | 'kanji' | 'vocabulary';
	/** Percentage of correct meaning answers */
	meaning_correct: number;
	/** Percentage of correct reading answers */
	reading_correct: number;
	/** Number of correct meaning answers */
	meaning_current_streak: number;
	/** Number of correct reading answers */
	reading_current_streak: number;
}

/**
 * Represents a review submission
 */
export interface Review extends CommonTimestamps {
	/** The review's unique ID */
	id: number;
	/** The subject this review is for */
	subject_id: number;
	/** Number of incorrect meaning answers */
	incorrect_meaning_answers: number;
	/** Number of incorrect reading answers */
	incorrect_reading_answers: number;
	/** When the review was started */
	started_at: string;
}

/**
 * Represents user-created study materials for a subject
 */
export interface StudyMaterial extends CommonTimestamps {
	/** The material's unique ID */
	id: number;
	/** The subject this material is for */
	subject_id: number;
	/** User's note about the meaning */
	meaning_note: string | null;
	/** User's note about the reading */
	reading_note: string | null;
	/** User's custom meaning synonyms */
	meaning_synonyms: string[];
	/** Whether the material is hidden */
	hidden: boolean;
} 