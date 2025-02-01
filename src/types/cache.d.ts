/** 
 * Represents cached data with optional HTTP caching headers
 * @template T The type of data being cached
 * @interface
 */
export interface CacheData<T> {
	/** The cached data */
	data: T;
	/** 
	 * Optional ETag header for HTTP conditional requests
	 * @type {string | undefined}
	 */
	etag?: string;
	/** 
	 * Optional Last-Modified header for HTTP conditional requests
	 * @type {string | undefined}
	 */
	lastModified?: string;
} 