"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Tag } from "lucide-react"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "~/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover"

interface TagSelectProps {
    tags: string[]
    selectedTag: string | null
    onTagSelect: (tag: string | null) => void
    className?: string
}

export function TagSelect({ tags, selectedTag, onTagSelect, className }: TagSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchValue, setSearchValue] = React.useState("")

    const filteredTags = React.useMemo(() => {
        if (!searchValue) return tags
        return tags.filter((tag) =>
            tag.toLowerCase().includes(searchValue.toLowerCase())
        )
    }, [tags, searchValue])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("justify-between h-full bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 hover:border-neutral-300 dark:hover:border-neutral-600", className)}
                >
                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                        <span className="text-neutral-600 dark:text-neutral-300">
                            {selectedTag ? `#${selectedTag}` : "Filter by tag"}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command className="rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <CommandInput
                        placeholder="Search tags..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                        className="h-9"
                    />
                    <CommandList>
                        <CommandEmpty className="py-6 text-center text-sm">
                            No tags found
                        </CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value=""
                                onSelect={() => {
                                    onTagSelect(null)
                                    setOpen(false)
                                }}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center">
                                    <Tag className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                    <span>All Tags</span>
                                </div>
                                <Check
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        !selectedTag ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </CommandItem>
                            {filteredTags.map((tag) => (
                                <CommandItem
                                    key={tag}
                                    value={tag}
                                    onSelect={() => {
                                        onTagSelect(tag === selectedTag ? null : tag)
                                        setOpen(false)
                                    }}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center">
                                        <span className="text-neutral-500 dark:text-neutral-400 mr-2">#</span>
                                        <span>{tag}</span>
                                    </div>
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            selectedTag === tag ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}