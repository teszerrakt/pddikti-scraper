import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { client } from "../src/api";

const server = new Server(
	{
		name: "pddikti-mcp-server",
		version: "1.0.0",
	},
	{
		capabilities: {
			tools: {},
		},
	},
);

// Define tool schemas
const SearchStudentSchema = z.object({
	query: z.string().describe("Name, NIM, or University to search for"),
});

const GetDetailSchema = z.object({
	id: z.string().describe("PDDIKTI Student ID"),
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: "search_students",
				description:
					"Search for students in the PDDIKTI database by name, NIM, or university name.",
				inputSchema: {
					type: "object",
					properties: {
						query: {
							type: "string",
							description: "Name, NIM, or University to search for",
						},
					},
					required: ["query"],
				},
			},
			{
				name: "get_student_detail",
				description:
					"Get detailed information about a specific student using their PDDIKTI ID.",
				inputSchema: {
					type: "object",
					properties: {
						id: {
							type: "string",
							description: "PDDIKTI Student ID",
						},
					},
					required: ["id"],
				},
			},
		],
	};
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params;

	try {
		if (name === "search_students") {
			const { query } = SearchStudentSchema.parse(args);
			const results = await client.search(query);
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(results, null, 2),
					},
				],
			};
		}

		if (name === "get_student_detail") {
			const { id } = GetDetailSchema.parse(args);
			const result = await client.getDetail(id);

			if (!result) {
				return {
					content: [
						{
							type: "text",
							text: "Student not found or error fetching details.",
						},
					],
					isError: true,
				};
			}

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result, null, 2),
					},
				],
			};
		}

		throw new Error(`Unknown tool: ${name}`);
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new Error(
				`Invalid arguments: ${error.errors
					.map((e) => `${e.path.join(".")}: ${e.message}`)
					.join(", ")}`,
			);
		}
		throw error;
	}
});

async function run() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	// console.error("PDDIKTI MCP Server running on Stdio");
}

run().catch((error) => {
	// console.error("Fatal error running server:", error);
	process.exit(1);
});
