# PDDIKTI Scraper SDK

A robust, type-safe TypeScript SDK for scraping student data from the PDDIKTI API. Built with **Bun** and **Zod**.

## Features

- 🚀 **Fluent API**: Chainable methods for building complex queries.
- 🔒 **Type-Safe**: Full TypeScript support with Zod validation.
- 🛠️ **Generic**: Configurable to search any program or keyword.
- ⚡ **Fast**: Optimized for Bun.

## Installation

```bash
bun install
```

## Usage

You can use the SDK in your own scripts. See `example/index.ts` for a complete demo.

```typescript
import { Pddikti } from "./src"; // Import from the SDK

// Example: Search for "Joko" in "Kehutanan UGM" and filter results
const results = await Pddikti.search("Joko Kehutanan UGM")
    .filterBy(s => s.nama.includes("Joko"))
    .getDetails()
    .filterBy(d => d.jenjang === "S1")
    .run();

console.log(results);
```

## Running the Demo

This repository includes a pre-configured example script.

```bash
# Run the demo scraper (Joko Kehutanan UGM & Bahlil UI)
bun run start
```

## Development

### Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

```bash
# Run lint check
bun run lint
```

Pre-commit hooks are configured with **Husky** and **lint-staged** to ensure code quality on every commit.

## Project Structure

```
pddikti-scraper/
├── src/
│   ├── index.ts      # SDK Entry Point
│   ├── pddikti.ts    # Fluent API Logic
│   ├── api.ts        # Low-level API Client
│   └── schemas.ts    # Zod Schemas
├── example/
│   └── index.ts      # Usage Demo
├── .husky/           # Git Hooks

## Disclaimer

This tool is intended for **educational and research purposes only**.

-   **Respect Privacy**: The data scraped contains Personally Identifiable Information (PII) such as names and student IDs. Do not use this tool to harvest data for malicious purposes, spam, or harassment.
-   **Legal Compliance**: Ensure you comply with all applicable laws and regulations in your jurisdiction (e.g., UU PDP in Indonesia, GDPR).
-   **Server Load**: Use the built-in delays respectfully. Do not overwhelm the target servers.
-   **Liability**: The authors are not responsible for any misuse of this tool.
