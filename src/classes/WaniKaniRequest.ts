import type { CacheData } from "../types/cache.js";
import type { RequestContext } from "../types/request.js";
import type { ApiResponse } from "../types/wanikani.js";
import { WaniKaniHttpStatus } from "../constants/http.js";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Handles HTTP requests to the WaniKani API with caching support
 * Implements conditional requests and cache management
 */
export class WaniKaniRequest {
	/**
	 * Creates a new WaniKani request handler
	 * @param {string} apiKey - WaniKani API key
	 * @param {string} baseUrl - Base URL for the API
	 * @param {string} apiRevision - API revision to use
	 * @param {string} cacheDir - Directory to store cache files
	 * @remarks Cache files are stored as JSON files in the specified cache directory.
	 * Each file is named using an MD5 hash of:
	 * - The endpoint path
	 * - Query parameters
	 * - Request method and body
	 * - First 8 characters of the API key hash (for multi-account support)
	 * 
	 * Cache files include:
	 * - The response data
	 * - ETag for conditional requests
	 * - Last-Modified timestamp
	 * 
	 * Files are automatically cleaned up based on:
	 * - TTL specified by each endpoint
	 * - Cache-Control headers from the API
	 * - Conditional request responses (304 Not Modified)
	 */
	constructor(
		private readonly apiKey: string,
		private readonly baseUrl: string,
		private readonly apiRevision: string,
		private readonly cacheDir: string
	) {
		// Ensure cache directory exists
		void fs.mkdir(this.cacheDir, { recursive: true });
	}

	/**
	 * Ensures the cache directory exists
	 * @returns {Promise<void>}
	 */
	private async ensureCacheDir(): Promise<void> {
		await fs.mkdir(this.cacheDir, { recursive: true });
	}

	/**
	 * Prepares headers for a request, including authentication and API revision
	 * @param {RequestInit} options - Request options that may contain custom headers
	 * @returns {Record<string, string>} Combined headers for the request
	 */
	private prepareHeaders(options: RequestInit): Record<string, string> {
		const baseHeaders: Record<string, string> = {
			"Authorization": `Bearer ${this.apiKey}`,
			"Content-Type": "application/json",
			"Wanikani-Revision": this.apiRevision,
		};

		const { headers } = options;
		if (headers !== undefined) {
			const customHeaders = Object.entries(headers)
			.filter(([ , value]) => typeof value === 'string')
			.reduce<Record<string, string>>((acc, [key, value]) => {
				if (typeof value === 'string') {
					acc[key] = value;
				}
				return acc;
			}, {});
			
			return { ...baseHeaders, ...customHeaders };
		}

		return baseHeaders;
	}

	/**
	 * Builds a URL for a request, optionally including updated_after parameter
	 * @param {string} endpoint - API endpoint path
	 * @param {Date} [updatedAfter] - Optional date to filter by update time
	 * @returns {URL} Complete URL for the request
	 */
	private buildRequestUrl(endpoint: string, updatedAfter?: Date): URL {
		const url = new URL(endpoint, this.baseUrl);
		if (updatedAfter !== undefined) {
			url.searchParams.set('updated_after', updatedAfter.toISOString());
		}
		return url;
	}

	/**
	 * Generates a cache key for a request based on endpoint and options
	 * @param {string} endpoint - API endpoint path
	 * @param {RequestInit} [options={}] - Request options
	 * @returns {string} MD5 hash to use as cache key
	 */
	private generateCacheKey(endpoint: string, options: RequestInit = {}): string {
		const urlObj = new URL(endpoint, 'https://base');
		const searchParams = urlObj.searchParams.toString();
        
		const relevantOptions = {
			method: options.method ?? 'GET',
			headers: options.headers ?? {},
			body: options.body,
		};

		const apiKeyTrimLength = 8;

		const uniqueString = JSON.stringify({
			endpoint: urlObj.pathname,
			params: searchParams,
			options: relevantOptions,
			apiKeyHash: crypto.createHash('sha256').update(this.apiKey).digest('hex').slice(0, apiKeyTrimLength)
		});

		return crypto.createHash('md5').update(uniqueString).digest('hex');
	}

	/**
	 * Type guard to check if an object has a data property
	 * @param {object} data - Object to check
	 * @returns {boolean} Type predicate for objects with data property
	 */
	private static hasDataProperty(data: object): data is { data: unknown } {
		return 'data' in data;
	}

	/**
	 * Checks if an object has a valid optional string property
	 * @param {Record<string, unknown>} obj - Object to check
	 * @param {string} key - Property name to check
	 * @returns {boolean} Whether the property is a valid optional string
	 */
	private static hasValidOptionalString(obj: Record<string, unknown>, key: string): boolean {
		return !(key in obj) || obj[key] === undefined || typeof obj[key] === 'string';
	}

	/**
	 * Type guard to validate cache data structure
	 * @template T The type of cached data
	 * @param {unknown} data - Data to validate
	 * @returns {boolean} Type predicate for CacheData<T>
	 */
	private static isCacheData<T>(data: unknown): data is CacheData<T> {
		if (typeof data !== 'object' || data === null) return false;
		if (!this.hasDataProperty(data)) return false;
		
		return this.hasValidOptionalString(data, 'etag') && this.hasValidOptionalString(data, 'lastModified');
	}

	/**
	 * Retrieves cached data if available and not expired
	 * @template T The type of cached data
	 * @param {string} endpoint - API endpoint path
	 * @param {RequestInit} options - Request options
	 * @param {number} ttl - Cache time-to-live in milliseconds
	 * @returns {Promise<CacheData<T> | null>} Promise resolving to cached data or null
	 */
	private async getCached<T>(endpoint: string, options: RequestInit, ttl: number): Promise<CacheData<T> | null> {
		try {
			const cacheKey = this.generateCacheKey(endpoint, options);
			const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);
			const stats = await fs.stat(cacheFile);
			const age = Date.now() - stats.mtimeMs;
            
			if (age < ttl) {
				const data = await fs.readFile(cacheFile, 'utf-8');
				const parsed: unknown = JSON.parse(data);
				if (WaniKaniRequest.isCacheData<T>(parsed)) {
					return parsed;
				}
			}
		} catch {
			return null;
		}
		return null;
	}

	/**
	 * Saves data to the cache
	 * @template T The type of data to cache
	 * @param {string} endpoint - API endpoint path
	 * @param {RequestInit} options - Request options
	 * @param {CacheData<T>} cacheData - Data to cache
	 * @returns {Promise<void>}
	 */
	private async setCache<T>(endpoint: string, options: RequestInit, cacheData: CacheData<T>): Promise<void> {
		await this.ensureCacheDir();
		const cacheKey = this.generateCacheKey(endpoint, options);
		const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);
		await fs.writeFile(cacheFile, JSON.stringify(cacheData));
	}

	/**
	 * Adds conditional request headers based on cached data
	 * @template T The type of cached data
	 * @param {Record<string, string>} headers - Headers object to modify
	 * @param {CacheData<T>} cacheData - Cached data containing etag and lastModified
	 * @returns {void}
	 */
	private static addConditionalHeaders<T>(headers: Record<string, string>, { etag, lastModified }: CacheData<T>): void {
		if (etag !== undefined && etag.length > 0) {
			headers["If-None-Match"] = etag;
		}
		if (lastModified !== undefined && lastModified.length > 0) {
			headers["If-Modified-Since"] = lastModified;
		}
	}

	/**
	 * Cleans up a single cache file if it's older than maxAge
	 * @param {string} filePath - Path to the cache file
	 * @param {number} maxAge - Maximum age in milliseconds
	 * @returns {Promise<void>}
	 */
	private static async cleanCacheFile(filePath: string, maxAge: number): Promise<void> {
		try {
			const stats = await fs.stat(filePath);
			const age = Date.now() - stats.mtimeMs;

			if (age > maxAge) {
				await fs.unlink(filePath);
			}
		} catch {
			// Skip files that can't be accessed or deleted
		}
	}

	/**
	 * Removes old cache files
	 * @param {number} maxAge - Maximum age in milliseconds
	 * @returns {Promise<void>}
	 */
	public async cleanOldCaches(maxAge: number): Promise<void> {
		try {
			const files = await fs.readdir(this.cacheDir, { withFileTypes: true });
			const jsonFiles = files.filter(file => file.isFile() && file.name.endsWith('.json'));
			await Promise.all(
				jsonFiles.map(async (file) => {
					await WaniKaniRequest.cleanCacheFile(path.join(this.cacheDir, file.name), maxAge);
				})
			);
		} catch (error) {
			console.warn('Failed to clean cache directory:', error);
		}
	}

	/**
	 * Handles cached response and conditional request headers
	 * @template T The type of response data
	 * @param {URL} url - Request URL
	 * @param {RequestInit} options - Request options
	 * @param {number} ttl - Cache time-to-live in milliseconds
	 * @param {Record<string, string>} headers - Headers object to modify
	 * @returns {Promise<{ cached: CacheData<T> | null }>} Promise resolving to cached data info
	 */
	private async handleCachedResponse<T>(url: URL, options: RequestInit, ttl: number, headers: Record<string, string>): Promise<{ cached: CacheData<T> | null }> {
		let cached: CacheData<T> | null = null;
		if (ttl > 0) {
			cached = await this.getCached(url.pathname + url.search, options, ttl);
			if (cached !== null) {
				WaniKaniRequest.addConditionalHeaders(headers, cached);
			}
		}
		return { cached };
	}

	/**
	 * Type guard to validate WaniKani API response structure
	 * @template T The type of response data
	 * @param {unknown} value - Value to validate
	 * @returns {boolean} Type predicate for ApiResponse<T>
	 */
	private static isApiResponse<T>(value: unknown): value is ApiResponse<T> {
		return typeof value === 'object' && 
			value !== null && 
			'object' in value &&
			'url' in value &&
			'data' in value;
	}

	/**
	 * Handles API response, including cached and not modified responses
	 * @template T The type of response data
	 * @param {Response} response - Fetch response object
	 * @param {CacheData<T> | null} cached - Previously cached data
	 * @returns {Promise<T>} Promise resolving to response data
	 * @throws {Error} If response is not ok or has invalid format
	 */
	private static async handleResponse<T>(response: Response, cached: CacheData<T> | null): Promise<T> {
		if (response.status === WaniKaniHttpStatus.NOT_MODIFIED) {
			if (cached === null) {
				throw new Error('Cache miss on 304 response');
			}
			return cached.data;
		}

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const parsed: unknown = await response.json();
		if (this.isApiResponse<T>(parsed)) {
			return parsed.data;
		}
		throw new Error('Invalid response format');
	}

	/**
	 * Updates the cache with new response data
	 * @param {RequestContext} context - Request context
	 * @param {number} ttl - Cache time-to-live in milliseconds
	 * @param {unknown} data - Data to cache
	 * @param {Response} response - Response object containing headers
	 * @returns {Promise<void>}
	 */
	private async updateCache(context: RequestContext, ttl: number, data: unknown, response: Response): Promise<void> {
		if (ttl > 0) {
			await this.setCache(context.url.pathname + context.url.search, context.options, {
				data,
				etag: response.headers.get('ETag') ?? undefined,
				lastModified: response.headers.get('Last-Modified') ?? undefined,
			});
		}
	}

	/**
	 * Makes a request to the WaniKani API with caching support
	 * @template T The type of response data
	 * @param {string} endpoint - API endpoint path
	 * @param {RequestInit} [options={}] - Request options
	 * @param {number} [ttl=0] - Cache time-to-live in milliseconds
	 * @param {Date} [updatedAfter] - Only get items updated after this date
	 * @returns {Promise<T>} Promise resolving to response data
	 * @throws {Error} If the request fails or returns invalid data
	 */
	public async request<T>(endpoint: string, options: RequestInit = {}, ttl = 0, updatedAfter?: Date): Promise<T> {
		const headers = this.prepareHeaders(options);
		const url = this.buildRequestUrl(endpoint, updatedAfter);
		const context = { url, options: { method: 'GET', ...options, headers } };
		
		const { cached } = await this.handleCachedResponse<T>(url, options, ttl, headers);
		const response = await fetch(url.toString(), context.options);
		const data = await WaniKaniRequest.handleResponse<T>(response, cached);
		await this.updateCache(context, ttl, data, response);
		
		return data;
	}
} 