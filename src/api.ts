import { z } from "zod";
import {
	type DetailResult,
	DetailResultSchema,
	type SearchResult,
	SearchResultSchema,
} from "./schemas";

export class PddiktiClient {
	private static readonly BASE_URL =
		"https://api-pddikti.kemdiktisaintek.go.id";
	private static readonly DELAY_MS = 500;

	private static readonly HEADERS = {
		Origin: "https://pddikti.kemdiktisaintek.go.id",
		Referer: "https://pddikti.kemdiktisaintek.go.id/",
		"User-Agent":
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	};

	/**
	 * Sleep utility for adding delays between API calls
	 */
	private async sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Fetch search results for a given query
	 */
	async search(query: string): Promise<SearchResult[]> {
		const encodedQuery = encodeURIComponent(query);
		const url = `${PddiktiClient.BASE_URL}/pencarian/mhs/${encodedQuery}`;

		console.error(`🔍 Searching for: ${query}`);

		try {
			await this.sleep(PddiktiClient.DELAY_MS);

			const response = await fetch(url, {
				headers: PddiktiClient.HEADERS,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			// Validate the response with Zod
			const results = z.array(SearchResultSchema).parse(data);
			console.error(`   Found ${results.length} students`);

			return results;
		} catch (error) {
			console.error(`❌ Error searching for ${query}:`, error);
			// In a real app, we might want to rethrow or handle differently,
			// but for scraping robustness, returning empty array is often safer to keep the loop going.
			// However, we should probably differentiate between network error and parse error.
			return [];
		}
	}

	/**
	 * Fetch detailed information for a student by ID
	 */
	async getDetail(id: string): Promise<DetailResult | null> {
		const url = `${PddiktiClient.BASE_URL}/detail/mhs/${id}`;

		try {
			await this.sleep(PddiktiClient.DELAY_MS);

			const response = await fetch(url, {
				headers: PddiktiClient.HEADERS,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			// Validate the response with Zod
			const detail = DetailResultSchema.parse(data);

			return detail;
		} catch (error) {
			console.error(`❌ Error fetching detail for ID ${id}:`, error);
			return null;
		}
	}
}

export const client = new PddiktiClient();
