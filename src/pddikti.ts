import { client } from "./api";
import type { DetailResult, FilteredStudent, SearchResult } from "./schemas";

/**
 * Builder for the Detail phase of the scraper.
 * Handles fetching details and filtering them.
 */
export class DetailBuilder {
	private detailFilters: ((detail: DetailResult) => boolean)[] = [];

	constructor(
		private query: string,
		private searchFilters: ((student: SearchResult) => boolean)[],
	) {}

	/**
	 * Add a filter for the detail results.
	 * @param predicate A function that takes a DetailResult and returns true to keep it.
	 */
	filterBy(predicate: (detail: DetailResult) => boolean): DetailBuilder {
		this.detailFilters.push(predicate);
		return this;
	}

	/**
	 * Execute the pipeline.
	 */
	async run(): Promise<FilteredStudent[]> {
		console.log(`\n📚 Processing query: ${this.query}`);
		console.log("=".repeat(50));

		// Step 1: Search
		const searchResults = await client.search(this.query);

		// Step 2: Apply Search Filters
		let filteredSearch = searchResults;
		for (const filter of this.searchFilters) {
			filteredSearch = filteredSearch.filter(filter);
		}
		console.log(
			`   Filtered to ${filteredSearch.length} students after search filters`,
		);

		// Step 3 & 4: Fetch Details and Apply Detail Filters
		const finalResults: FilteredStudent[] = [];
		let matchCount = 0;

		for (const student of filteredSearch) {
			const detail = await client.getDetail(student.id);

			if (detail) {
				// Apply all detail filters
				const passesFilters = this.detailFilters.every((filter) =>
					filter(detail),
				);

				if (passesFilters) {
					matchCount++;
					console.log(`   ✅ Match found: ${detail.nama} (${detail.nim})`);
					finalResults.push({
						query: this.query,
						searchResult: student,
						detailResult: detail,
					});
				}
			}
		}

		console.log(`   Total matches for ${this.query}: ${matchCount}`);
		return finalResults;
	}
}

/**
 * Builder for the Search phase of the scraper.
 * Handles defining the search query and initial filters.
 */
export class SearchBuilder {
	private searchFilters: ((student: SearchResult) => boolean)[] = [];

	constructor(private query: string) {}

	/**
	 * Add a filter for the search results (before fetching details).
	 * @param predicate A function that takes a SearchResult and returns true to keep it.
	 */
	filterBy(predicate: (student: SearchResult) => boolean): SearchBuilder {
		this.searchFilters.push(predicate);
		return this;
	}

	/**
	 * Transition to the Detail phase.
	 */
	getDetails(): DetailBuilder {
		return new DetailBuilder(this.query, this.searchFilters);
	}
}

/**
 * Entry point for the Chainable API.
 */
export class Pddikti {
	/**
	 * Start a new search query.
	 */
	static search(query: string): SearchBuilder {
		return new SearchBuilder(query);
	}
}
