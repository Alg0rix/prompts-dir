import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Search } from "lucide-react";
import { useState } from "react";
import { PromptCard } from "~/components/prompt-card";
import { getAllPrompts, getAllTags, getAllCategories, type Prompt } from "~/lib/prompts";
import type { MetaFunction } from "@remix-run/cloudflare";
import { TagSelect } from "~/components/ui/tag-select";
import { CategorySidebar } from "~/components/ui/category-sidebar";

export const meta: MetaFunction = () => {
  return [
    { title: "Prompt Collection - Browse, search, and discover useful prompts" },
    { name: "description", content: "A curated collection of useful prompts for various tasks" },
  ];
};

export async function loader() {
  const prompts = await getAllPrompts();
  const tags = getAllTags(prompts);
  const categories = getAllCategories(prompts);

  return json({
    prompts,
    tags,
    categories,
  });
}

export default function Index() {
  const { prompts, tags, categories } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPrompts = prompts.filter((prompt: Prompt) => {
    const matchesSearch = searchTerm === "" ||
      prompt.frontmatter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.frontmatter.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag = selectedTag === null || prompt.frontmatter.tags.includes(selectedTag);
    const matchesCategory = selectedCategory === null ||
      prompt.frontmatter.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesTag && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50">
      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 max-w-[1600px]">
        <header className="mb-16 md:mb-20 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-neutral-950 to-neutral-700 dark:from-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">
            Prompt Collection
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-10 md:mb-12 max-w-2xl mx-auto">
            Browse, search, and discover useful prompts for various tasks
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto p-4 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 h-9 text-sm border border-neutral-200 rounded-lg bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow dark:focus:ring-blue-500/20 dark:focus:border-blue-500"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-shrink-0">
              <TagSelect
                tags={tags}
                selectedTag={selectedTag}
                onTagSelect={setSelectedTag}
                className="w-full sm:w-[180px] h-9 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
              />
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sticky Category Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 shrink-0">
            <div className="sticky top-8">
              <CategorySidebar
                categories={categories}
                prompts={prompts}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                className="w-full lg:max-h-[calc(100vh-8rem)] overflow-y-auto bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 py-4"
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results count */}
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Found <span className="font-medium text-neutral-900 dark:text-neutral-200">{filteredPrompts.length}</span> prompt{filteredPrompts.length !== 1 ? "s" : ""}
                {selectedCategory && <span> in <span className="font-medium text-neutral-900 dark:text-neutral-200">{selectedCategory}</span></span>}
                {selectedTag && <span> tagged <span className="font-medium text-neutral-900 dark:text-neutral-200">{selectedTag}</span></span>}
                {searchTerm && <span> matching <span className="font-medium text-neutral-900 dark:text-neutral-200">"{searchTerm}"</span></span>}
              </div>
            </div>

            {/* Prompts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
              {filteredPrompts.map((prompt: Prompt) => (
                <PromptCard key={prompt.slug} prompt={prompt} />
              ))}

              {filteredPrompts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                  <div className="bg-white dark:bg-neutral-800 rounded-full p-3 mb-4 shadow-sm">
                    <Search className="h-6 w-6 text-neutral-400" />
                  </div>
                  <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                    No prompts found
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-md">
                    Try adjusting your search or filter to find what you're looking for
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="mt-24 text-center border-t border-neutral-200 dark:border-neutral-800 pt-8 pb-12">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Want to contribute? Add your prompts via{" "}
            <a
              href="https://github.com/Alg0rix/prompts-dir"
              className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
            >
              GitHub
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
