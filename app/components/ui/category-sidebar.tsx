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

    // Filter categories based on search term
    const filteredCategories = React.useMemo(() => {
        if (!searchTerm) return categories
        return categories.filter(category =>
            category.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [categories, searchTerm])

    return (
        <div className={cn("w-full max-w-xs flex flex-col gap-2", className)}>
            <div className="px-4 py-2">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Categories</h2>
            </div>

            <div className="px-4 mb-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 h-9 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500/20 focus:border-neutral-500 transition-shadow dark:focus:ring-neutral-400/20 dark:focus:border-neutral-400"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5 px-2">
                <button
                    onClick={() => onCategorySelect(null)}
                    className={cn(
                        "flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm transition-colors group",
                        !selectedCategory ?
                            "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100" :
                            "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Folder className="h-4 w-4" />
                        <span className="font-medium">All Categories</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200/50 dark:bg-neutral-700/50">
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
                            "flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm transition-colors group",
                            selectedCategory === category ?
                                "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100" :
                                "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Folder className="h-4 w-4" />
                            <span className="font-medium">{category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200/50 dark:bg-neutral-700/50">
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
    )
}