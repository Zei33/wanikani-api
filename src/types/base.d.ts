/**
 * Generic response structure from the WaniKani API
 * @template T The type of data contained in the response
 */
export interface ApiResponse<T> {
	/** The type of object returned */
	object: string;
	/** The URL of the request that generated this response */
	url: string;
	/** The main data payload */
	data: T;
	/** Additional fields that may be present in the response */
	additional_data: Record<string, unknown>;
}

/**
 * Common timestamp fields shared across many WaniKani resources
 */
export interface CommonTimestamps {
	/** When the resource was created */
	created_at: string;
	/** When the resource was last updated */
	updated_at: string;
} 