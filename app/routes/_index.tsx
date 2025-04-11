import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Search, Menu, X, Filter } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { PromptCard } from "~/components/prompt-card";
import { getAllPrompts, getAllTags, getAllCategories, type Prompt } from "~/lib/prompts";
import type { MetaFunction } from "@remix-run/cloudflare";
import { TagSelect } from "~/components/ui/tag-select";
import { CategorySidebar } from "~/components/ui/category-sidebar";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { ScrollToTop } from "~/components/ui/scroll-to-top";

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
  const filteredPrompts = useMemo(() => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <ScrollToTop />
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 max-w-[1600px]">
        {/* Modernized Header with Hero Section */}
        <header className="relative mb-12 md:mb-16 lg:mb-20">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-br from-blue-50/60 via-purple-50/60 to-pink-50/60 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-pink-950/40 blur-3xl opacity-70"></div>
            <div className="absolute -top-[350px] -left-[100px] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 blur-3xl"></div>
            <div className="absolute -top-[150px] -right-[100px] h-[400px] w-[600px] rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 blur-3xl"></div>
          </div>

          <div className="max-w-4xl mx-auto mb-8 md:mb-12 relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-1.5 mb-6 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-medium border border-blue-100 dark:border-blue-800/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Browse, Search & Discover
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 leading-tight tracking-tight">
                Prompt Collection
              </h1>

              <p className="text-lg md:text-xl lg:text-2xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-8 md:mb-10">
                Discover and utilize powerful prompts for AI assistants like ChatGPT, Claude, and Copilot
              </p>

              {/* Enhanced CTA Banner */}
              <div className="w-full max-w-3xl mx-auto overflow-hidden rounded-2xl shadow-xl">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 p-0.5">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE1MCAxMDBDMTUwIDEyOC4wNyAxMjguMDcgMTUwIDEwMCAxNTBDNzEuOTMgMTUwIDUwIDEyOC4wNyA1MCAxMDBDNTAgNzEuOTMgNzEuOTMgNTAgMTAwIDUwQzEyOC4wNyA1MCAxNTAgNzEuOTMgMTUwIDEwMFoiIHN0cm9rZT0idXJsKCNwYWludDBfbGluZWFyKSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtZGFzaGFycmFyeT0iNCA0Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSJ3aGl0ZSIgc3RvcC1vcGFjaXR5PSIwIi8+PC9zdmc+')]"></div>
                  <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 rounded-[calc(1rem-2px)] bg-white/95 dark:bg-neutral-900/95 p-6 md:p-8 overflow-hidden">
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                        Want to Share Your Prompts?
                      </h3>
                      <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-300 max-w-lg">
                        Join our community and contribute your own prompts to help others unlock the full potential of AI assistants
                      </p>
                    </div>
                    <a
                      href="https://github.com/Alg0rix/prompts-dir"
                      className="inline-flex items-center justify-center px-4 md:px-6 py-3 md:py-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-sm md:text-base hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-600/40 hover:scale-105 active:scale-100"
                    >
                      Contribute Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern search and filters bar */}
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="p-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-lg">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search prompts by title, content, or author..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 placeholder-neutral-400 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:ring-blue-500/20 dark:focus:border-blue-500 transition-shadow"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Desktop filters */}
                <div className="hidden sm:flex gap-2">
                  <div className="relative min-w-[160px]">
                    <TagSelect
                      tags={tags}
                      selectedTag={selectedTag}
                      onTagSelect={setSelectedTag}
                      className="w-full h-10 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                </div>

                {/* Mobile filter buttons */}
                <div className="flex sm:hidden gap-2">
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 shadow-sm"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                    {selectedTag && <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">1</span>}
                  </button>

                  <button
                    onClick={() => setMobileCategoriesOpen(true)}
                    className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 shadow-sm"
                  >
                    <Menu className="h-4 w-4" />
                    <span>Categories</span>
                    {selectedCategory && <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">1</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Category Sidebar */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
            <div className="sticky top-8">
              <CategorySidebar
                categories={categories}
                prompts={prompts}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                className="w-full max-h-[calc(100vh-8rem)] overflow-y-auto bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-xl shadow-lg border border-neutral-200/80 dark:border-neutral-800/80 py-4"
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results summary */}
            <div className="mb-6 md:mb-8 flex items-center justify-between flex-wrap gap-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm px-4 py-3 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm">
              <div className="text-sm text-neutral-600 dark:text-neutral-400 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                  {filteredPrompts.length}
                </span>
                prompt{filteredPrompts.length !== 1 ? "s" : ""}
                {selectedCategory && (
                  <>
                    <span className="text-neutral-400 dark:text-neutral-600">•</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-200">{selectedCategory}</span>
                  </>
                )}
                {selectedTag && (
                  <>
                    <span className="text-neutral-400 dark:text-neutral-600">•</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-200">#{selectedTag}</span>
                  </>
                )}
                {searchTerm && (
                  <>
                    <span className="text-neutral-400 dark:text-neutral-600">•</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-200">"{searchTerm}"</span>
                  </>
                )}
              </div>

              {/* Mobile active filters display */}
              <div className="lg:hidden flex flex-wrap gap-2">
                {selectedCategory && (
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
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
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
                    #{selectedTag}
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
              {filteredPrompts.map((prompt: Prompt, index: number) => (
                <div
                  key={prompt.slug}
                  className="animate-fadeIn"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <PromptCard prompt={prompt} />
                </div>
              ))}

              {filteredPrompts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 md:py-16 px-4 rounded-xl md:rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full p-4 mb-4 shadow-sm">
                    <Search className="h-6 w-6 md:h-8 md:w-8 text-blue-500 dark:text-blue-400" />
                  </div>
                  <p className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    No prompts found
                  </p>
                  <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 text-center max-w-md">
                    Try adjusting your search criteria or removing filters to find what you're looking for
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
