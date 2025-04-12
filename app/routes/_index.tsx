import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Search, Menu, X, Filter, Folder } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { PromptCard } from "~/components/prompt-card";
import { getAllPrompts, getAllTags, getAllCategories, type Prompt } from "~/lib/prompts";
import type { MetaFunction } from "@remix-run/cloudflare";
import { TagSelect } from "~/components/ui/tag-select";
import { CategorySidebar } from "~/components/ui/category-sidebar";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { ScrollToTop } from "~/components/ui/scroll-to-top";

// Define base URL
const BASE_URL = "https://promptllm.xyz"; // Consistent with the sitemap.xml domain

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = "Prompt Collection: AI Prompts for ChatGPT, Claude & More";
  const description = "Discover, search, and share powerful AI prompts for ChatGPT, Claude, Copilot, and other assistants. Enhance your productivity with our curated prompt library.";
  const imageUrl = `${BASE_URL}/android-chrome-512x512.png`; // Use a suitable image URL
  const pageUrl = `${BASE_URL}/`; // URL of the current page

  return [
    { title: title },
    { name: "description", content: description },
    { name: "keywords", content: "AI prompts, ChatGPT prompts, Claude prompts, Copilot prompts, prompt engineering, prompt library, AI assistant prompts, generative AI" },

    // Canonical URL
    { tagName: "link", rel: "canonical", href: pageUrl },

    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:url", content: pageUrl },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: pageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },

    // Optional: If you have a Twitter handle
    // { name: "twitter:site", content: "@YourTwitterHandle" },
    // { name: "twitter:creator", content: "@YourTwitterHandle" },
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

// Function to generate JSON-LD structured data
function getStructuredData(prompts: Prompt[]) {
  const title = "Prompt Collection: AI Prompts for ChatGPT, Claude & More";
  const description = "Discover, search, and share powerful AI prompts for ChatGPT, Claude, Copilot, and other assistants. Enhance your productivity with our curated prompt library.";
  const pageUrl = `${BASE_URL}/`; // URL of the current page

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": title,
    "url": pageUrl,
    "description": description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${pageUrl}?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    // Example of itemList for prompts if needed, adjust based on how prompts are displayed/structured
    /*
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": prompts.slice(0, 5).map((prompt, index) => ({ // Example: first 5 prompts
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "CreativeWork",
          "name": prompt.frontmatter.title,
          "description": prompt.frontmatter.description || prompt.content.substring(0, 100) + '...', // Use frontmatter description or excerpt
          // "url": `${pageUrl}prompt/${prompt.slug}` // If prompts have individual pages
        }
      }))
    }
    */
  };
  return JSON.stringify(structuredData);
}

export default function Index() {
  const { prompts, tags, categories } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  // State to track which prompt modal should be open
  const [openPromptSlug, setOpenPromptSlug] = useState<string | null>(null);

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
    return prompts
      .filter(filterPrompts)
      .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
  }, [prompts, filterPrompts]);

  // Generate structured data
  const structuredDataJson = useMemo(() => getStructuredData(prompts), [prompts]);

  // Check for prompt slug in URL when component mounts
  useEffect(() => {
    // Check if there's a prompt parameter in the URL
    const url = new URL(window.location.href);
    const promptSlug = url.searchParams.get('prompt');

    if (promptSlug) {
      // Find the prompt with the matching slug
      const matchingPrompt = prompts.find(p => p.slug === promptSlug);
      if (matchingPrompt) {
        // Open the modal for this prompt
        setOpenPromptSlug(promptSlug);

        // Clean up the URL by removing the prompt parameter
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('prompt');
        window.history.replaceState({}, document.title, cleanUrl.toString());
      }
    }
  }, [prompts]);

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
      {/* Add JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredDataJson }}
      />
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

              <p className="text-lg md:text-xl lg:text-2xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-6 md:mb-8">
                Discover and utilize powerful prompts for AI assistants like ChatGPT, Claude, and Copilot
              </p>

              {/* Side by side buttons container */}
              <div className="w-full max-w-3xl mx-auto mb-8 md:mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Learn Prompt Engineering Button - Column 1 */}
                <div className="w-full">
                  <a
                    href="https://docs.promptllm.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-full gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500/90 to-purple-500/90 text-white hover:from-indigo-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] group"
                  >
                    <span className="text-xl font-bold">✨</span>
                    <span className="font-semibold">Learn Prompt Engineering</span>
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>

                {/* GitHub Star Button - Column 2 */}
                <div className="w-full">
                  <a
                    href="https://github.com/Alg0rix/prompts-dir"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-full gap-2 px-5 py-3 bg-neutral-100 dark:bg-neutral-800/90 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all shadow-sm hover:shadow-md group"
                  >
                    <svg className="h-5 w-5 text-yellow-500 group-hover:animate-spin-slow" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
                    </svg>
                    <span className="font-medium">Star on GitHub</span>
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                      Support Us!
                    </span>
                  </a>
                </div>
              </div>

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
            <div className="p-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-lg">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Search className="h-4 w-4 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search prompts by title, content, or author..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 placeholder-neutral-400 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:ring-blue-500/20 dark:focus:border-blue-500 transition-shadow"
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
                      className="w-full h-10 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl"
                    />
                  </div>
                </div>

                {/* Mobile filter buttons */}
                <div className="flex sm:hidden gap-2">
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 shadow-sm"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                    {selectedTag && <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">1</span>}
                  </button>

                  <button
                    onClick={() => setMobileCategoriesOpen(true)}
                    className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 shadow-sm"
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
                className="w-full max-h-[calc(100vh-8rem)] overflow-y-auto shadow-lg"
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Results summary */}
            <div className="mb-6 md:mb-8 flex items-center justify-between flex-wrap gap-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm px-5 py-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm">
              <div className="text-sm text-neutral-600 dark:text-neutral-400 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500/90 to-purple-500/90 text-white font-medium">
                  {filteredPrompts.length}
                </span>
                prompt{filteredPrompts.length !== 1 ? "s" : ""}
                {(selectedCategory || selectedTag || searchTerm) && (
                  <span className="text-neutral-400 dark:text-neutral-600 ml-1">matching</span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                    <Folder className="h-3.5 w-3.5" />
                    {selectedCategory}
                  </span>
                )}
                {selectedTag && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
                    #{selectedTag}
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium">
                    <Search className="h-3.5 w-3.5" />
                    "{searchTerm}"
                  </span>
                )}
              </div>

              {/* Mobile active filters display */}
              <div className="lg:hidden flex flex-wrap gap-2">
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <Folder className="h-3.5 w-3.5" />
                    {selectedCategory}
                    <X className="h-3.5 w-3.5 ml-1" />
                  </button>
                )}
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-100 dark:border-purple-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                  >
                    #{selectedTag}
                    <X className="h-3.5 w-3.5 ml-1" />
                  </button>
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
                  <PromptCard
                    prompt={prompt}
                    isOpen={openPromptSlug === prompt.slug}
                    onOpenChange={(open) => {
                      if (open) {
                        setOpenPromptSlug(prompt.slug);
                      } else if (openPromptSlug === prompt.slug) {
                        setOpenPromptSlug(null);
                      }
                    }}
                  />
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

        {/* Enhanced Footer */}
        <footer className="mt-16 md:mt-24 pt-12 pb-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
              {/* About Section */}
              <div className="col-span-1 md:col-span-1 lg:col-span-1">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">About</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  A community-driven collection of useful prompts for AI assistants to help you get the most out of ChatGPT, Claude, Copilot and more.
                </p>
                <div className="flex items-center space-x-3 mt-4">
                  <a href="https://github.com/Alg0rix/prompts-dir" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors" aria-label="GitHub">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>

                </div>
              </div>

              {/* Resources Section */}
              <div className="col-span-1 md:col-span-1 lg:col-span-1">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Resources</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a href="https://github.com/Alg0rix/prompts-dir/issues/new" className="text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      Report an Issue
                    </a>
                  </li>
                  <li>
                    <a href="https://docs.promptllm.xyz" target="_blank" rel="noopener noreferrer" className="text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      Learn Prompt Engineering
                    </a>
                  </li>
                </ul>
              </div>




            </div>

            {/* Bottom section with copyright */}
            <div className="pt-8 mt-8 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    © {new Date().getFullYear()} Prompt Collection. All rights reserved.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center md:justify-end gap-6">
                  <a
                    href="https://github.com/Alg0rix/prompts-dir"
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Contribute on GitHub
                  </a>

                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
