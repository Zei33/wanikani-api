/**
 * Context for making HTTP requests, containing URL and options
 * @interface
 */
export interface RequestContext {
	/** The complete URL for the request */
	url: URL;
	/** Request initialization options */
	options: RequestInit;
}

/**
 * Represents the structure of a package.json file
 * Only includes the fields we need for our purposes
 * @interface
 */
export interface PackageJson {
	/** The name of the package */
	name: string;
	/** 
	 * Any additional fields in package.json
	 * @type {unknown}
	 */
	[key: string]: unknown;
}

/** Cache TTL configuration */
export interface CacheTTLConfig {
	/** Cache duration for subjects (in seconds) */
	subjects?: number;
	/** Cache duration for assignments (in seconds) */
	assignments?: number;
	/** Cache duration for reviews (in seconds) */
	reviews?: number;
	/** Cache duration for user data (in seconds) */
	user?: number;
	/** Cache duration for study materials (in seconds) */
	studyMaterials?: number;
	/** Cache duration for summary data (in seconds) */
	summary?: number;
	/** Cache duration for voice actors (in seconds) */
	voiceActors?: number;
	/** Cache duration for level progressions (in seconds) */
	levelProgressions?: number;
	/** Cache duration for resets (in seconds) */
	resets?: number;
	/** Cache duration for review statistics (in seconds) */
	reviewStatistics?: number;
	/** Cache duration for spaced repetition systems (in seconds) */
	srs?: number;
	/** Default cache duration for other endpoints (in seconds) */
	default?: number;
}

/** WaniKani API configuration options */
export interface WaniKaniAPIConfig {
	/** Cache TTL configuration */
	cacheTTL?: CacheTTLConfig;
} 