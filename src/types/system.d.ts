import type { CommonTimestamps } from "./base.js";

/**
 * Represents a spaced repetition system stage
 */
export interface SrsStage {
	/** Position in the SRS system (0-9) */
	position: number;
	/** Name of the stage (e.g., "Apprentice", "Guru") */
	name: string;
	/** Time interval until next review */
	interval: number | null;
	/** Time interval position (e.g., "seconds", "days", etc) */
	interval_unit: string | null;
	/** Number of reviews needed to pass the stage */
	reviews_required: number;
}

/**
 * Represents a spaced repetition system
 */
export interface Srs extends CommonTimestamps {
	/** The system's unique ID */
	id: number;
	/** Name of the SRS (e.g., "Default" or "Accelerated") */
	name: string;
	/** Description of the system */
	description: string;
	/** Unlocking stage */
	unlocking_stage_position: number;
	/** Starting stage */
	starting_stage_position: number;
	/** Position of passing stage */
	passing_stage_position: number;
	/** Position of burning stage */
	burning_stage_position: number;
	/** Array of stages in the system */
	stages: SrsStage[];
}

/**
 * Represents a voice actor
 */
export interface VoiceActor extends CommonTimestamps {
	/** The voice actor's unique ID */
	id: number;
	/** Voice actor's description */
	description: string;
	/** Voice actor's gender */
	gender: string;
	/** Name of the voice actor */
	name: string;
} 