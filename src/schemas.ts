import { z } from "zod";

/**
 * Schema for search result items from the PDDIKTI API
 */
export const SearchResultSchema = z.object({
	id: z.string(),
	nama: z.string(),
	nim: z.string(),
	nama_pt: z.string(),
	sinkatan_pt: z.string(),
	nama_prodi: z.string(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

/**
 * Schema for detailed student information from the PDDIKTI API
 */
export const DetailResultSchema = z.object({
	id: z.string(),
	nama_pt: z.string(),
	kode_pt: z.string(),
	kode_prodi: z.string(),
	prodi: z.string(),
	nama: z.string(),
	nim: z.string(),
	jenis_daftar: z.string(),
	id_pt: z.string(),
	id_sms: z.string(),
	jenis_kelamin: z.enum(["L", "P"]),
	jenjang: z.string(),
	status_saat_ini: z.string(),
	tanggal_masuk: z.coerce.date(),
});

export type DetailResult = z.infer<typeof DetailResultSchema>;

/**
 * Schema for the final filtered result
 */
export const FilteredStudentSchema = z.object({
	query: z.string(),
	searchResult: SearchResultSchema,
	detailResult: DetailResultSchema,
});

export type FilteredStudent = z.infer<typeof FilteredStudentSchema>;
