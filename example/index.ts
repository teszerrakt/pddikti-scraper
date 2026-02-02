import { Pddikti } from "../src/pddikti";
import type {
	DetailResult,
	FilteredStudent,
	SearchResult,
} from "../src/schemas";

/**
 * Configuration for the scraper
 */
export interface ScraperConfig {
	queries: string[];
	searchFilters?: ((student: SearchResult) => boolean)[];
	detailFilters?: ((detail: DetailResult) => boolean)[];
}

/**
 * Main scraper function using the Fluent API
 */
export async function scrape(
	config: ScraperConfig,
): Promise<FilteredStudent[]> {
	const allResults: FilteredStudent[] = [];

	console.log("🚀 Starting PDDIKTI scraper...\n");

	for (const query of config.queries) {
		// Compose the pipeline
		let searchBuilder = Pddikti.search(query);

		// Apply search filters
		if (config.searchFilters) {
			for (const filter of config.searchFilters) {
				searchBuilder = searchBuilder.filterBy(filter);
			}
		}

		const detailBuilder = searchBuilder.getDetails();

		// Apply detail filters
		if (config.detailFilters) {
			for (const filter of config.detailFilters) {
				detailBuilder.filterBy(filter);
			}
		}

		const programResults = await detailBuilder.run();
		allResults.push(...programResults);
	}

	console.log("\n" + "=".repeat(50));
	console.log(`🎉 Scraping complete! Total matches: ${allResults.length}`);

	return allResults;
}

/**
 * Save results to a JSON file
 */
async function saveResults(
	results: FilteredStudent[],
	queries: string[],
	filename: string,
) {
	const output = {
		timestamp: new Date().toISOString(),
		total_count: results.length,
		queries: queries,
		results,
	};

	await Bun.write(filename, JSON.stringify(output, null, 2));
	console.log(`\n💾 Results saved to: ${filename}`);
}

/**
 * Run the scraper (when executed directly)
 */
if (import.meta.main) {
	const config: ScraperConfig = {
		queries: ["Joko Kehutanan UGM", "Bahlil UI"],
		searchFilters: [],
		detailFilters: [
			// Broad filter to capture various degrees including S3/Doctoral
			(d) =>
				[
					"S1",
					"S-1",
					"Sarjana",
					"S2",
					"S-2",
					"Magister",
					"S3",
					"S-3",
					"Doktor",
				].includes(d.jenjang),
		],
	};

	const results = await scrape(config);
	await saveResults(results, config.queries, "pddikti_results.json");
}
