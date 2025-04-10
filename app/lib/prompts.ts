import fs from "fs";
import path from "path";
import matter from "gray-matter";
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

const promptsDirectory = path.join(process.cwd(), "app/prompts");

export async function getAllPrompts(): Promise<Prompt[]> {
  const fileNames = fs.readdirSync(promptsDirectory);

  const prompts = await Promise.all(fileNames.map(async (fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(promptsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    const { data, content } = matter(fileContents);

    return {
      slug,
      frontmatter: {
        title: data.title || slug,
        author: data.author || "Anonymous",
        authorLink: data.authorLink || null,
        category: data.category || "General",
        tags: data.tags || [],
      },
      content,
      html: await marked(content),
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
