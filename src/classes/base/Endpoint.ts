import type { WaniKaniRequest } from "../WaniKaniRequest.js";
import type { CacheTTLConfig } from "../../types/request.js";

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

	/** Cache TTL configuration */
	protected readonly cacheTTL: CacheTTLConfig;

	/**
	 * Creates a new endpoint instance
	 * @param {WaniKaniRequest} request - The request handler to use for API calls
	 * @param {CacheTTLConfig} [cacheTTL={}] - Optional cache TTL configuration
	 */
	constructor(request: WaniKaniRequest, cacheTTL: CacheTTLConfig = {}) {
		this.request = request;
		this.cacheTTL = cacheTTL;
	}

	/**
	 * Long cache duration for rarely updated resources (24 hours)
	 * @type {number}
	 */
	protected static readonly LONG_TTL = 86400000;

	/**
	 * Gets the cache TTL for a specific endpoint
	 * @param {keyof CacheTTLConfig} endpoint - The endpoint to get TTL for
	 * @returns {number} The TTL in seconds
	 */
	protected getCacheTTL(endpoint: keyof CacheTTLConfig): number {
		return (this.cacheTTL[endpoint] ?? this.cacheTTL.default ?? Endpoint.DEFAULT_TTL) * 1000;
	}

	/**
	 * Makes a request to the WaniKani API
	 * @template T - The expected response data type
	 * @param {string} endpoint - The API endpoint to request
	 * @param {Record<string, unknown>} [params={}] - Optional query parameters
	 * @param {keyof CacheTTLConfig} [ttlKey] - Key to use for cache TTL lookup
	 * @param {Date} [updatedAfter] - Only fetch resources updated after this date
	 * @returns {Promise<T>} Promise resolving to the response data
	 */
	protected async makeRequest<T>(
		endpoint: string,
		params: Record<string, unknown> = {},
		ttlKey?: keyof CacheTTLConfig,
		updatedAfter?: Date
	): Promise<T> {
		const ttl = ttlKey !== undefined ? this.getCacheTTL(ttlKey) : 0;
		return await this.request.request<T>(endpoint, params, ttl, updatedAfter);
	}
} 