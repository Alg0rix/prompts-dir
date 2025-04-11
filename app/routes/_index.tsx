import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Search, Menu, X, Filter } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { PromptCard } from "~/components/prompt-card";
import { getAllPrompts, getAllTags, getAllCategories, type Prompt } from "~/lib/prompts";
import type { MetaFunction } from "@remix-run/cloudflare";
import { TagSelect } from "~/components/ui/tag-select";
import { CategorySidebar } from "~/components/ui/category-sidebar";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";

export const meta: MetaFunction = () => {
  return [
    { title: "Prompt Collection - Browse, search, and discover useful prompts" },
    { name: "description", content: "A curated collection of useful prompts for various tasks" },
  ];
};

export async function loader({ context, request }: { context: any, request: Request }) {
  const prompts = await getAllPrompts(context.env, request);
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  // Memoize the filter function to prevent unnecessary recalculations
  const filterPrompts = useCallback((prompt: Prompt) => {
    if (!prompt.frontmatter) return false;

    // Quick exit if no filters are active
    if (!debouncedSearchTerm && !selectedTag && !selectedCategory) {
      return true;
    }

    // Check category first (fastest check)
    if (selectedCategory &&
      prompt.frontmatter.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    // Then check tag (also relatively fast)
    if (selectedTag && !prompt.frontmatter.tags.includes(selectedTag)) {
      return false;
    }

    // Search term check last (most expensive)
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      return (
        prompt.frontmatter.title.toLowerCase().includes(searchLower) ||
        prompt.frontmatter.author.toLowerCase().includes(searchLower) ||
        prompt.content.toLowerCase().includes(searchLower)
      );
    }

    return true;
  }, [debouncedSearchTerm, selectedTag, selectedCategory]);

  // Track window width for responsive behavior
  const [windowWidth, setWindowWidth] = useState<number | null>(null);

  // Debounce search term with a longer delay for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Increased to 500ms for better performance

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoize filtered prompts to prevent unnecessary recalculations
  const filteredPrompts = useCallback(() => {
    return prompts.filter(filterPrompts);
  }, [prompts, filterPrompts]);

  useEffect(() => {
    // Set initial window width
    setWindowWidth(window.innerWidth);

    // Update window width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menus when switching to desktop
  useEffect(() => {
    if (windowWidth && windowWidth >= 1024) {
      setMobileFiltersOpen(false);
      setMobileCategoriesOpen(false);
    }
  }, [windowWidth]);

  // Get the filtered prompts only when needed
  const filteredResults = filteredPrompts();

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50">
      <div className="container mx-auto px-4 py-8 md:py-16 lg:py-20 max-w-[1600px]">
        <header className="mb-10 md:mb-16 text-center max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-6 bg-gradient-to-r from-neutral-950 to-neutral-700 dark:from-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">
            Prompt Collection
          </h1>
          <p className="text-base md:text-xl text-neutral-600 dark:text-neutral-300 mb-6 md:mb-12 max-w-2xl mx-auto">
            Browse, search, and discover useful prompts for various tasks
          </p>

          {/* Desktop search and filters */}
          <div className="hidden sm:flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto p-4 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800">
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

          {/* Mobile search and filter buttons */}
          <div className="sm:hidden flex flex-col gap-3 max-w-full mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2.5 h-10 text-sm border border-neutral-200 rounded-lg bg-white dark:bg-neutral-900 dark:border-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow dark:focus:ring-blue-500/20 dark:focus:border-blue-500 shadow-sm"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 shadow-sm"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {selectedTag && <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">1</span>}
              </button>

              <button
                onClick={() => setMobileCategoriesOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 shadow-sm"
              >
                <Menu className="h-4 w-4" />
                <span>Categories</span>
                {selectedCategory && <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">1</span>}
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Category Sidebar */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
            <div className="sticky top-8">
              <CategorySidebar
                categories={categories}
                prompts={prompts}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                className="w-full max-h-[calc(100vh-8rem)] overflow-y-auto bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 py-4"
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results count */}
            <div className="mb-6 md:mb-8 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                <span className="font-medium text-neutral-900 dark:text-neutral-200">{filteredPrompts.length}</span> prompt{filteredPrompts.length !== 1 ? "s" : ""}
                {selectedCategory && <span> in <span className="font-medium text-neutral-900 dark:text-neutral-200">{selectedCategory}</span></span>}
                {selectedTag && <span> tagged <span className="font-medium text-neutral-900 dark:text-neutral-200">{selectedTag}</span></span>}
                {searchTerm && <span> matching <span className="font-medium text-neutral-900 dark:text-neutral-200">"{searchTerm}"</span></span>}
              </div>

              {/* Mobile active filters display */}
              <div className="lg:hidden flex flex-wrap gap-2">
                {selectedCategory && (
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="ml-1.5 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {selectedTag && (
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {selectedTag}
                    <button
                      onClick={() => setSelectedTag(null)}
                      className="ml-1.5 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Prompts grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
              {filteredPrompts.map((prompt: Prompt) => (
                <PromptCard key={prompt.slug} prompt={prompt} />
              ))}

              {filteredPrompts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 md:py-16 px-4 rounded-xl md:rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                  <div className="bg-white dark:bg-neutral-800 rounded-full p-3 mb-4 shadow-sm">
                    <Search className="h-5 w-5 md:h-6 md:w-6 text-neutral-400" />
                  </div>
                  <p className="text-base md:text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">
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

        {/* Mobile Tag Filter Dialog */}
        <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <DialogContent className="!p-0 !max-w-lg sm:!max-w-xl !translate-y-0 !top-auto !bottom-0 !rounded-b-none flex flex-col max-h-[80vh]">
            <div className="p-4 flex-shrink-0 border-b border-neutral-200 dark:border-neutral-800">
              <DialogTitle className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                Filter Prompts
              </DialogTitle>
            </div>

            <div className="p-4 overflow-y-auto flex-grow">
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Filter by Tag
                  </label>
                  <TagSelect
                    tags={tags}
                    selectedTag={selectedTag}
                    onTagSelect={(tag) => {
                      setSelectedTag(tag);
                      if (windowWidth && windowWidth < 640) {
                        setMobileFiltersOpen(false);
                      }
                    }}
                    className="w-full h-9 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                  />
                </div>

                {selectedTag && (
                  <div className="pt-2">
                    <button
                      onClick={() => setSelectedTag(null)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <X className="h-3.5 w-3.5 mr-1.5" />
                      Clear tag filter
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 flex-shrink-0 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedTag(null);
                    setMobileFiltersOpen(false);
                  }}
                  className="flex-1 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mobile Categories Dialog */}
        <Dialog open={mobileCategoriesOpen} onOpenChange={setMobileCategoriesOpen}>
          <DialogContent className="!p-0 !max-w-lg sm:!max-w-xl !translate-y-0 !top-auto !bottom-0 !rounded-b-none flex flex-col max-h-[80vh]">
            <div className="p-4 flex-shrink-0 border-b border-neutral-200 dark:border-neutral-800">
              <DialogTitle className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                Categories
              </DialogTitle>
            </div>

            <div className="overflow-y-auto flex-grow p-4">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setMobileCategoriesOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left text-sm ${selectedCategory === null
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                >
                  <span>All Categories</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {prompts.length}
                  </span>
                </button>

                {categories.map((category) => {
                  const count = prompts.filter((p) => p.frontmatter.category === category).length;
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setMobileCategoriesOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left text-sm ${selectedCategory === category
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                    >
                      <span>{category}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <footer className="mt-16 md:mt-24 text-center border-t border-neutral-200 dark:border-neutral-800 pt-8 pb-12">
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
