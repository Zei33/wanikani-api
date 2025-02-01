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