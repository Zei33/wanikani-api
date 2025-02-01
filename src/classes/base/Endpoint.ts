import type { WaniKaniRequest } from "../WaniKaniRequest.js";

/**
 * Base class for all WaniKani API endpoints
 * Provides common functionality for making requests and handling responses
 * @abstract
 * @class
 */
export abstract class Endpoint {
	/** Default cache TTL in seconds (1 hour) */
	protected static readonly DEFAULT_TTL = 60 * 60;

	/** Request handler for making API calls */
	protected readonly request: WaniKaniRequest;

	/**
	 * Creates a new endpoint instance
	 * @param {WaniKaniRequest} request - The request handler to use for API calls
	 */
	constructor(request: WaniKaniRequest) {
		this.request = request;
	}

	/**
	 * Long cache duration for rarely updated resources (24 hours)
	 * @type {number}
	 */
	protected static readonly LONG_TTL = 86400000;

	/**
	 * Makes a request to the WaniKani API
	 * @template T - The expected response data type
	 * @param {string} endpoint - The API endpoint to request
	 * @param {Record<string, unknown>} [params={}] - Optional query parameters
	 * @param {number} [cacheTTL=Endpoint.DEFAULT_TTL] - How long to cache the response (in seconds)
	 * @param {Date} [updatedAfter] - Only fetch resources updated after this date
	 * @returns {Promise<T>} Promise resolving to the response data
	 */
	protected async makeRequest<T>(
		endpoint: string,
		params: Record<string, unknown> = {},
		cacheTTL = Endpoint.DEFAULT_TTL,
		updatedAfter?: Date
	): Promise<T> {
		return await this.request.request<T>(endpoint, params, cacheTTL * 1000, updatedAfter);
	}
} 