import type { ApiResponse, StudyMaterial } from "../../types/wanikani.js";
import { Endpoint } from "../base/Endpoint.js";

/**
 * Handles study material-related API endpoints
 * @see {@link https://docs.api.wanikani.com/20170710/#study-materials Study Materials API Documentation}
 * @extends {Endpoint}
 */
export class StudyMaterialsEndpoint extends Endpoint {
	/**
	 * Gets all study materials
	 * @param {Object} [options] - Optional parameters
	 * @param {Date} [options.updatedAfter] - Only fetch materials updated after this date
	 * @returns {Promise<ApiResponse<StudyMaterial[]>>} Promise resolving to an array of study materials
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-all-study-materials Get All Study Materials API Documentation}
	 * @example
	 * ```typescript
	 * // Get all study materials
	 * const allMaterials = await api.studyMaterials.getAll();
	 * 
	 * // Get materials updated after a date
	 * const recentMaterials = await api.studyMaterials.getAll({
	 *   updatedAfter: new Date('2024-01-01')
	 * });
	 * ```
	 */
	public async getAll(options: { updatedAfter?: Date } = {}): Promise<ApiResponse<StudyMaterial[]>> {
		return await this.makeRequest(
			"study_materials",
			{},
			"studyMaterials",
			options.updatedAfter
		);
	}

	/**
	 * Gets a specific study material by ID
	 * @param {number} id - The study material ID to retrieve
	 * @returns {Promise<StudyMaterial>} Promise resolving to the study material data
	 * @see {@link https://docs.api.wanikani.com/20170710/#get-a-specific-study-material Get Specific Study Material API Documentation}
	 * @example
	 * ```typescript
	 * // Get study material with ID 1234
	 * const material = await api.studyMaterials.get(1234);
	 * ```
	 */
	public async get(id: number): Promise<StudyMaterial> {
		return await this.makeRequest(
			`study_materials/${id}`,
			{},
			"studyMaterials"
		);
	}

	/**
	 * Creates a new study material
	 * @param {Object} data - The study material data
	 * @param {number} data.subjectId - The subject ID this material is for
	 * @param {string} [data.meaningNote] - Optional note about the meaning
	 * @param {string} [data.readingNote] - Optional note about the reading
	 * @param {string[]} [data.meaningSynonyms] - Optional array of meaning synonyms
	 * @returns {Promise<StudyMaterial>} Promise resolving to the created study material
	 * @see {@link https://docs.api.wanikani.com/20170710/#create-a-study-material Create Study Material API Documentation}
	 * @example
	 * ```typescript
	 * // Create a new study material
	 * const newMaterial = await api.studyMaterials.create({
	 *   subjectId: 1234,
	 *   meaningNote: "Remember this as...",
	 *   readingNote: "Sounds like...",
	 *   meaningSynonyms: ["alternative", "meaning"]
	 * });
	 * ```
	 */
	public async create(data: StudyMaterial): Promise<StudyMaterial> {
		return await this.makeRequest(
			"study_materials",
			{
				method: "POST",
				body: JSON.stringify(data)
			}
		);
	}

	/**
	 * Updates an existing study material
	 * @param {number} id - The study material ID to update
	 * @param {Object} data - The update data
	 * @param {string} [data.meaningNote] - Optional note about the meaning
	 * @param {string} [data.readingNote] - Optional note about the reading
	 * @param {string[]} [data.meaningSynonyms] - Optional array of meaning synonyms
	 * @returns {Promise<StudyMaterial>} Promise resolving to the updated study material
	 * @see {@link https://docs.api.wanikani.com/20170710/#update-a-study-material Update Study Material API Documentation}
	 * @example
	 * ```typescript
	 * // Update an existing study material
	 * const updatedMaterial = await api.studyMaterials.update(1234, {
	 *   meaningNote: "Updated meaning note",
	 *   meaningSynonyms: ["new", "synonyms"]
	 * });
	 * ```
	 */
	public async update(id: number, data: Partial<StudyMaterial>): Promise<StudyMaterial> {
		return await this.makeRequest(
			`study_materials/${id}`,
			{
				method: "PUT",
				body: JSON.stringify(data)
			}
		);
	}
} 