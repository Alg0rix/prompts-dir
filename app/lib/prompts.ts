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

export async function getAllPrompts(env?: any, request?: Request): Promise<Prompt[]> {
  let csvContent: string;

  // Use different methods to fetch the CSV based on the environment
  if (env && env.ASSETS) {
    // In Cloudflare Pages environment, use env.ASSETS.fetch()
    const response = await env.ASSETS.fetch(csvPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }
    csvContent = await response.text();
  } else {
    // Fallback for development environment - use the request URL as base
    try {
      // Get the base URL from the request
      let baseUrl: string;
      if (request && request.url) {
        // Extract the origin (protocol + hostname + port) from the request URL
        const url = new URL(request.url);
        baseUrl = url.origin;
      } else {
        // Fallback if no request is available
        baseUrl = "http://localhost:3000";
      }

      // Create the full URL to the CSV file
      const csvUrl = new URL(csvPath, baseUrl).toString();

      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status}`);
      }
      csvContent = await response.text();
    } catch (error) {
      console.error("Error fetching CSV file:", error);
      throw error;
    }
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

  return prompts;
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
