/**
 * HTTP status codes used by the WaniKani API
 * @const
 * @type {const}
 */
export const WaniKaniHttpStatus = {
	/**
	 * Successful request (200)
	 * Indicates that the request has succeeded.
	 * @type {200}
	 */
	OK: 200,

	/**
	 * Resource hasn't been modified since last request (304)
	 * Used with conditional requests (If-None-Match/If-Modified-Since)
	 * to indicate the cached version is still valid.
	 * @type {304}
	 */
	NOT_MODIFIED: 304,

	/**
	 * Invalid request (400)
	 * The request could not be understood or was missing required parameters.
	 * @type {400}
	 */
	BAD_REQUEST: 400,

	/**
	 * Invalid API key (401)
	 * Authentication failed, typically due to an invalid or missing API key.
	 * @type {401}
	 */
	UNAUTHORIZED: 401,

	/**
	 * Resource not found (404)
	 * The requested resource could not be found on the server.
	 * @type {404}
	 */
	NOT_FOUND: 404,

	/**
	 * Rate limit exceeded (429)
	 * Too many requests have been made in a given time period.
	 * @type {429}
	 */
	TOO_MANY_REQUESTS: 429
} as const; 