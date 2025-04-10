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

interface CategorySelectProps {
    categories: string[]
    selectedCategory: string | null
    onCategorySelect: (category: string | null) => void
    className?: string
}

export function CategorySelect({ categories, selectedCategory, onCategorySelect, className }: CategorySelectProps) {
    const [open, setOpen] = React.useState(false)

    const categoryItems = categories.map(category => ({
        value: category.toLowerCase(),
        label: category
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
                    {selectedCategory
                        ? categoryItems.find((item) => item.value === selectedCategory.toLowerCase())?.label
                        : "All Categories"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search categories..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No categories found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value=""
                                onSelect={() => {
                                    onCategorySelect(null)
                                    setOpen(false)
                                }}
                            >
                                All Categories
                                <Check
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        !selectedCategory ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </CommandItem>
                            {categoryItems.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.value}
                                    onSelect={(currentValue) => {
                                        onCategorySelect(currentValue === selectedCategory?.toLowerCase() ? null : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    {item.label}
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            selectedCategory?.toLowerCase() === item.value ? "opacity-100" : "opacity-0"
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