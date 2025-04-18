import { marked } from "marked";

export interface Prompt {
  slug: string;
  frontmatter: {
    title: string;
    author: string;
    authorLink?: string;
    category: string;
    tags: string[];
  };
  content: string;
  html: string;
}

const csvPath = "/prompts.csv";

// Simple CSV parser function that handles quoted fields and multiline values
function parseCSV(text: string): Array<Record<string, string>> {
  // Split by rows, but handle quoted content with newlines
  const rows: string[] = [];
  let currentRow = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && (nextChar === ',' || nextChar === '\n' || nextChar === '\r' || nextChar === undefined)) {
      insideQuotes = false;
    } else if (char === '"' && (text[i - 1] === ',' || text[i - 1] === '\n' || text[i - 1] === '\r' || i === 0)) {
      insideQuotes = true;
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (currentRow.trim()) {
        rows.push(currentRow);
      }
      currentRow = '';
      // Skip \r\n sequence
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    } else {
      currentRow += char;
    }
  }

  // Add the last row if it's not empty
  if (currentRow.trim()) {
    rows.push(currentRow);
  }

  // Get headers
  if (rows.length === 0) {
    return [];
  }

  const headers = parseCSVRow(rows[0]);

  // Parse each data row
  const records: Array<Record<string, string>> = [];

  for (let i = 1; i < rows.length; i++) {
    const values = parseCSVRow(rows[i]);

    if (values.length === headers.length) {
      const record: Record<string, string> = {};

      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = values[j];
      }

      records.push(record);
    }
  }

  return records;
}

// Parse a single CSV row into an array of values
function parseCSVRow(row: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      // Handle double quotes inside quoted strings
      if (insideQuotes && row[i + 1] === '"') {
        currentValue += '"';
        i++; // Skip the next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      values.push(currentValue);
      currentValue = '';
    } else {
      // Add character to current field
      currentValue += char;
    }
  }

  // Add the last value
  values.push(currentValue);

  return values;
}

// Cache for getAllPrompts requests
let promptsCache: {
  data: Prompt[] | null;
  timestamp: number;
  promise: Promise<Prompt[]> | null;
} = {
  data: null,
  timestamp: 0,
  promise: null,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getAllPrompts(env?: any, request?: Request): Promise<Prompt[]> {
  // If there's an ongoing request, return its promise
  if (promptsCache.promise) {
    return promptsCache.promise;
  }

  // If we have cached data that's not expired, return it
  if (promptsCache.data && Date.now() - promptsCache.timestamp < CACHE_TTL) {
    return promptsCache.data;
  }

  // Create a new promise for the request
  promptsCache.promise = (async () => {
    let csvContent: string;

    try {
      // Use different methods to fetch the CSV based on the environment
      if (env && env.ASSETS) {
        // In Cloudflare Pages environment, use env.ASSETS.fetch()
        const response = await env.ASSETS.fetch(csvPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.status}`);
        }
        csvContent = await response.text();
      } else {
        // Fallback for development environment - use browser URL or window location if available
        // Get the base URL from the current environment
        let baseUrl: string;
        if (request && request.url) {
          // Extract the origin (protocol + hostname + port) from the request URL
          const url = new URL(request.url);
          baseUrl = url.origin;
        } else if (typeof window !== 'undefined') {
          // Use current window location if in browser environment
          baseUrl = window.location.origin;
        } else {
          // Last resort fallback
          baseUrl = "http://localhost:5173";
        }

        // Create the full URL to the CSV file
        const csvUrl = new URL(csvPath, baseUrl).toString();

        const response = await fetch(csvUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.status}`);
        }
        csvContent = await response.text();
      }

      // Parse the CSV content using our custom parser
      const records = parseCSV(csvContent);

      const prompts = await Promise.all(records.map(async (record: any) => {
        // Generate slug from title
        const slug = record.title
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .replace(/\s+/g, "-");

        // Parse tags as an array
        const tags = record.tags ? record.tags.split(',') : [];

        return {
          slug,
          frontmatter: {
            title: record.title || slug,
            author: record.author || "Anonymous",
            authorLink: record.authorLink || null,
            category: record.category || "General",
            tags: tags,
          },
          content: record.promptContent,
          html: await marked(record.promptContent),
        };
      }));

      // Update cache with new data
      promptsCache.data = prompts;
      promptsCache.timestamp = Date.now();
      return prompts;
    } catch (error) {
      // Clear cache on error
      promptsCache.data = null;
      promptsCache.timestamp = 0;
      throw error;
    } finally {
      // Clear the promise reference
      promptsCache.promise = null;
    }
  })();

  return promptsCache.promise;
}

export function getAllTags(prompts: Prompt[]): string[] {
  const tagsSet = new Set<string>();

  prompts.forEach((prompt) => {
    prompt.frontmatter.tags.forEach((tag) => {
      tagsSet.add(tag);
    });
  });

  return Array.from(tagsSet);
}

export function getAllCategories(prompts: Prompt[]): string[] {
  const categoriesSet = new Set<string>();

  prompts.forEach((prompt) => {
    if (prompt.frontmatter.category) {
      categoriesSet.add(prompt.frontmatter.category);
    }
  });

  return Array.from(categoriesSet);
}
