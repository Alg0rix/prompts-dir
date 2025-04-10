"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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

    const tagItems = tags.map(tag => ({
        value: tag.toLowerCase(),
        label: tag
    }))

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("justify-between", className)}
                >
                    {selectedTag
                        ? tagItems.find((item) => item.value === selectedTag.toLowerCase())?.label
                        : "All Tags"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search tags..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No tags found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value=""
                                onSelect={() => {
                                    onTagSelect(null)
                                    setOpen(false)
                                }}
                            >
                                All Tags
                                <Check
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        !selectedTag ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </CommandItem>
                            {tagItems.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.value}
                                    onSelect={(currentValue) => {
                                        onTagSelect(currentValue === selectedTag?.toLowerCase() ? null : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    {item.label}
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            selectedTag?.toLowerCase() === item.value ? "opacity-100" : "opacity-0"
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