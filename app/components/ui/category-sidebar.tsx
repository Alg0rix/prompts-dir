"use client"

import * as React from "react"
import { type Prompt } from "~/lib/prompts"
import { cn } from "~/lib/utils"
import { Folder, ChevronRight, Search } from "lucide-react"

interface CategorySidebarProps {
    categories: string[]
    prompts: Prompt[]
    selectedCategory: string | null
    onCategorySelect: (category: string | null) => void
    className?: string
}

export function CategorySidebar({
    categories,
    prompts,
    selectedCategory,
    onCategorySelect,
    className
}: CategorySidebarProps) {
    const [searchTerm, setSearchTerm] = React.useState("")

    // Count prompts per category
    const categoryPromptCount = React.useMemo(() => {
        const counts: Record<string, number> = { 'All': prompts.length }
        categories.forEach(category => {
            counts[category] = prompts.filter(p => p.frontmatter.category === category).length
        })
        return counts
    }, [categories, prompts])

    // Filter and sort categories based on search term
    const filteredCategories = React.useMemo(() => {
        const sorted = [...categories].sort((a, b) => a.localeCompare(b))
        if (!searchTerm) return sorted
        return sorted.filter(category =>
            category.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [categories, searchTerm])

    return (
        <div className={cn("w-full max-w-xs flex flex-col rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm overflow-hidden", className)}>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
                <div className="px-4 py-3">
                    <h2 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Categories</h2>
                </div>

                <div className="px-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 h-9 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow dark:focus:ring-blue-500/20 dark:focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable content with fade indicators */}
            <div className="relative flex-1 min-h-0">
                <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white/50 to-transparent dark:from-neutral-900/50 pointer-events-none z-10" />
                <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white/50 to-transparent dark:from-neutral-900/50 pointer-events-none z-10" />

                <div className="overflow-y-auto max-h-[calc(100vh-16rem)] px-2 py-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-track]:bg-transparent">
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => onCategorySelect(null)}
                            className={cn(
                                "flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm transition-all group hover:bg-neutral-100 dark:hover:bg-neutral-800/50",
                                !selectedCategory
                                    ? "bg-gradient-to-r from-blue-500/90 to-purple-500/90 text-white font-medium hover:from-blue-600/90 hover:to-purple-600/90"
                                    : "text-neutral-600 dark:text-neutral-400"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Folder className="h-4 w-4" />
                                <span>All Categories</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full",
                                    !selectedCategory
                                        ? "bg-white/20 text-white"
                                        : "bg-neutral-200/50 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-400"
                                )}>
                                    {categoryPromptCount['All']}
                                </span>
                                <ChevronRight className={cn(
                                    "h-4 w-4 transition-transform",
                                    !selectedCategory && "transform rotate-90"
                                )} />
                            </div>
                        </button>

                        {filteredCategories.map((category) => (
                            <button
                                key={category}
                                onClick={() => onCategorySelect(category)}
                                className={cn(
                                    "flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm transition-all group hover:bg-neutral-100 dark:hover:bg-neutral-800/50",
                                    selectedCategory === category
                                        ? "bg-gradient-to-r from-blue-500/90 to-purple-500/90 text-white font-medium hover:from-blue-600/90 hover:to-purple-600/90"
                                        : "text-neutral-600 dark:text-neutral-400"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Folder className="h-4 w-4" />
                                    <span>{category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-xs px-2 py-0.5 rounded-full",
                                        selectedCategory === category
                                            ? "bg-white/20 text-white"
                                            : "bg-neutral-200/50 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-400"
                                    )}>
                                        {categoryPromptCount[category]}
                                    </span>
                                    <ChevronRight className={cn(
                                        "h-4 w-4 transition-transform",
                                        selectedCategory === category && "transform rotate-90"
                                    )} />
                                </div>
                            </button>
                        ))}

                        {searchTerm && filteredCategories.length === 0 && (
                            <div className="px-4 py-8 text-center">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    No categories found matching "{searchTerm}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}