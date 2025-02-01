import "dotenv/config";
import cachedir from "cachedir";
import path from "path";
import fs from "fs/promises";
import type { PackageJson } from "../types/request.js";
import { WaniKaniRequest } from "./WaniKaniRequest.js";
import { UserEndpoint } from "./endpoints/UserEndpoint.js";
import { AssignmentsEndpoint } from "./endpoints/AssignmentsEndpoint.js";
import { SubjectsEndpoint } from "./endpoints/SubjectsEndpoint.js";
import { ReviewsEndpoint } from "./endpoints/ReviewsEndpoint.js";
import { ReviewStatisticsEndpoint } from "./endpoints/ReviewStatisticsEndpoint.js";
import { StudyMaterialsEndpoint } from "./endpoints/StudyMaterialsEndpoint.js";
import { ResetsEndpoint } from "./endpoints/ResetsEndpoint.js";
import { LevelProgressionsEndpoint } from "./endpoints/LevelProgressionsEndpoint.js";
import { SpacedRepetitionSystemsEndpoint } from "./endpoints/SpacedRepetitionSystemsEndpoint.js";
import { SummaryEndpoint } from "./endpoints/SummaryEndpoint.js";
import { VoiceActorsEndpoint } from "./endpoints/VoiceActorsEndpoint.js";

/**
 * Main client for interacting with the WaniKani API
 * Handles authentication, caching, and provides access to all API endpoints
 * @see {@link https://docs.api.wanikani.com/20170710 WaniKani API Documentation}
 * @example
 * ```typescript
 * const api = new WaniKaniAPI();
 * 
 * // Get user information
 * const user = await api.user.get();
 * 
 * // Get all assignments
 * const assignments = await api.assignments.getAll();
 * ```
 */
export class WaniKaniAPI {
	private readonly apiKey: string;
	private readonly baseUrl = "https://api.wanikani.com/v2/";
	private cacheDir!: string;
	private readonly apiRevision = "20170710";
	private request!: WaniKaniRequest;
	private readonly initPromise: Promise<void>;

	/** User-related endpoints 
	 * @see {@link https://docs.api.wanikani.com/20170710/#user User API Documentation}
	 */
	public user!: UserEndpoint;

	/** Assignment-related endpoints 
	 * @see {@link https://docs.api.wanikani.com/20170710/#assignments Assignments API Documentation}
	 */
	public assignments!: AssignmentsEndpoint;

	/** Subject-related endpoints 
	 * @see {@link https://docs.api.wanikani.com/20170710/#subjects Subjects API Documentation}
	 */
	public subjects!: SubjectsEndpoint;

	/** Review-related endpoints 
	 * @see {@link https://docs.api.wanikani.com/20170710/#reviews Reviews API Documentation}
	 */
	public reviews!: ReviewsEndpoint;

	/** Review statistics-related endpoints 
	 * @see {@link https://docs.api.wanikani.com/20170710/#review-statistics Review Statistics API Documentation}
	 */
	public reviewStatistics!: ReviewStatisticsEndpoint;

	/** Study materials-related endpoints 
	 * @see {@link https://docs.api.wanikani.com/20170710/#study-materials Study Materials API Documentation}
	 */
	public studyMaterials!: StudyMaterialsEndpoint;

	/** Level reset-related endpoints 
	 * @see {@link https://docs.api.wanikani.com/20170710/#resets Resets API Documentation}
	 */
	public resets!: ResetsEndpoint;

	/** Level progressions endpoint 
	 * @see {@link https://docs.api.wanikani.com/20170710/#level-progressions Level Progressions API Documentation}
	 */
	public levelProgressions!: LevelProgressionsEndpoint;

	/** Spaced repetition systems endpoint 
	 * @see {@link https://docs.api.wanikani.com/20170710/#spaced-repetition-systems SRS API Documentation}
	 */
	public spacedRepetitionSystems!: SpacedRepetitionSystemsEndpoint;

	/** Summary endpoint 
	 * @see {@link https://docs.api.wanikani.com/20170710/#summary Summary API Documentation}
	 */
	public summary!: SummaryEndpoint;

	/** Voice actors endpoint 
	 * @see {@link https://docs.api.wanikani.com/20170710/#voice-actors Voice Actors API Documentation}
	 */
	public voiceActors!: VoiceActorsEndpoint;

	/**
	 * Creates a new WaniKani API client
	 * @param {string} [apiKey] - Optional API key (will use WANIKANI_API_KEY environment variable if not provided)
	 * @throws {Error} If no API key is provided or found in environment
	 */
	constructor(apiKey?: string) {
		const resolvedApiKey = apiKey ?? process.env.WANIKANI_API_KEY;
		if (typeof resolvedApiKey !== 'string' || resolvedApiKey.length === 0) {
			throw new Error("WaniKani API key is required, either set the WANIKANI_API_KEY environment variable or pass it as an argument to the constructor.");
		}

		this.apiKey = resolvedApiKey;
		this.initPromise = this.initCache().then(() => {
			this.user = new UserEndpoint(this.request);
			this.assignments = new AssignmentsEndpoint(this.request);
			this.subjects = new SubjectsEndpoint(this.request);
			this.reviews = new ReviewsEndpoint(this.request);
			this.reviewStatistics = new ReviewStatisticsEndpoint(this.request);
			this.studyMaterials = new StudyMaterialsEndpoint(this.request);
			this.resets = new ResetsEndpoint(this.request);
			this.levelProgressions = new LevelProgressionsEndpoint(this.request);
			this.spacedRepetitionSystems = new SpacedRepetitionSystemsEndpoint(this.request);
			this.summary = new SummaryEndpoint(this.request);
			this.voiceActors = new VoiceActorsEndpoint(this.request);
		});
	}

	/**
	 * Type guard to validate package.json structure
	 * @param {unknown} value - Value to check
	 * @returns {boolean} True if value is a valid PackageJson object
	 */
	private static isPackageJson(value: unknown): value is PackageJson {
		return typeof value === 'object' && 
			value !== null && 
			'name' in value && 
			typeof value.name === 'string';
	}

	/**
	 * Initializes the cache directory and request handler
	 * @returns {Promise<void>}
	 * @remarks Cache files are stored in OS-specific locations:
	 * - macOS: ~/Library/Caches/<package-name>
	 * - Linux: ~/.cache/<package-name>
	 * - Windows: %LOCALAPPDATA%\<package-name>\Cache
	 * 
	 * The package name is determined from the nearest package.json, falling back to 'wanikani-api'.
	 * Each request is cached in a separate file using an MD5 hash of the request details as the filename.
	 * Cache duration varies by endpoint based on how frequently the data changes.
	 */
	private async initCache(): Promise<void> {
		const pkgName = await WaniKaniAPI.findRootPackageName();
		this.cacheDir = cachedir(pkgName);
		this.request = new WaniKaniRequest(
			this.apiKey,
			this.baseUrl,
			this.apiRevision,
			this.cacheDir
		);
	}

	/**
	 * Finds the nearest package.json file in parent directories and returns its name
	 * @returns {Promise<string>} The package name or 'wanikani-api' as fallback
	 * @remarks This is used to create an OS-appropriate cache directory name.
	 * The function walks up the directory tree looking for a package.json file.
	 * If none is found, it defaults to 'wanikani-api' to ensure a valid cache location.
	 */
	private static async findRootPackageName(): Promise<string> {
		let currentDir = process.cwd();
		const { root } = path.parse(currentDir);

		while (currentDir !== root) {
			try {
				const pkgPath = path.join(currentDir, 'package.json');
				const parsed: unknown = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
				if (!WaniKaniAPI.isPackageJson(parsed)) {
					throw new Error('Invalid package.json format');
				}
				return parsed.name;
			} catch {
				currentDir = path.dirname(currentDir);
			}
		}
		return 'wanikani-api'; // Fallback name
	}

	/**
	 * Helper method to check if content should be accessible based on user's subscription level.
	 * This automatically retrieves the user's subscription data from cache or API.
	 * 
	 * @param {number} level - The level of the content to check
	 * @returns {Promise<boolean>} Promise resolving to whether the content should be accessible
	 */
	public async isContentAccessible(level: number): Promise<boolean> {
		const user = await this.user.get();
		return level <= user.data.data.subscription.max_level_granted;
	}
}

export default WaniKaniAPI;