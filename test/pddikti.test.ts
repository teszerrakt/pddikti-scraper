import { describe, expect, mock, spyOn, test } from "bun:test";
import { PddiktiClient } from "../src/api";
import { Pddikti } from "../src/pddikti";
import type { DetailResult, SearchResult } from "../src/schemas";

// Mock Data
const mockSearchResult: SearchResult = {
	id: "search-id-1",
	nama: "Joko Widodo",
	nim: "123456",
	nama_pt: "Universitas Gadjah Mada",
	sinkatan_pt: "UGM",
	nama_prodi: "Kehutanan",
};

const mockDetailResult: DetailResult = {
	id: "detail-id-1",
	nama: "Joko Widodo",
	nim: "123456",
	nama_pt: "Universitas Gadjah Mada",
	kode_pt: "001",
	kode_prodi: "101",
	prodi: "Kehutanan",
	jenis_daftar: "Peserta Didik Baru",
	id_pt: "pt-1",
	id_sms: "sms-1",
	jenis_kelamin: "L",
	jenjang: "S1",
	status_saat_ini: "Lulus",
	tanggal_masuk: new Date("1980-09-01"),
};

describe("Pddikti Scraper SDK", () => {
	test("should create a SearchBuilder with a query", () => {
		const builder = Pddikti.search("Joko");
		expect(builder).toBeDefined();
		// @ts-expect-error - Accessing private property for testing
		expect(builder.query).toBe("Joko");
	});

	test("should apply search filters", async () => {
		// Mock the client search
		spyOn(PddiktiClient.prototype, "search").mockResolvedValue([
			mockSearchResult,
			{ ...mockSearchResult, nama: "Budi", id: "search-id-2" },
		]);

		// Mock getDetail to return null (we stop at search for this test logic check)
		// Actually search filters run *after* search fetch but *before* getDetails
		// But SearchBuilder doesn't expose run(), only getDetails().run()

		// So we test the full flow
		spyOn(PddiktiClient.prototype, "getDetail").mockResolvedValue(
			mockDetailResult,
		);

		const builder = Pddikti.search("Joko").filterBy((s) =>
			s.nama.includes("Joko"),
		);

		// We need to complete the chain to run it
		const results = await builder.getDetails().run();

		expect(results.length).toBe(1);
		expect(results[0].searchResult.nama).toBe("Joko Widodo");
	});

	test("should apply detail filters", async () => {
		spyOn(PddiktiClient.prototype, "search").mockResolvedValue([
			mockSearchResult,
		]);

		// Mock detail to return a specific gender
		spyOn(PddiktiClient.prototype, "getDetail").mockResolvedValue(
			mockDetailResult,
		);

		const results = await Pddikti.search("Joko")
			.getDetails()
			.filterBy((d) => d.jenis_kelamin === "L")
			.run();

		expect(results.length).toBe(1);
		expect(results[0].detailResult.jenis_kelamin).toBe("L");
	});

	test("should filter out details that do not match", async () => {
		spyOn(PddiktiClient.prototype, "search").mockResolvedValue([
			mockSearchResult,
		]);
		spyOn(PddiktiClient.prototype, "getDetail").mockResolvedValue(
			mockDetailResult,
		);

		const results = await Pddikti.search("Joko")
			.getDetails()
			.filterBy((d) => d.jenis_kelamin === "P") // Expecting Female, but mock is Male
			.run();

		expect(results.length).toBe(0);
	});
});
