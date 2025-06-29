"use client";

import { Check, Search, X, Plus } from "lucide-react";
import * as React from "react";
import { useDebounce } from "use-debounce";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FormControl, FormItem, FormLabel, FormMessage } from "./form";

export interface SelectItem {
  id: string;
  name: string;
  [key: string]: any;
}

interface SearchableSelectProps {
  // Display configuration
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  label?: string;

  // Value handling
  value?: string;
  onChange?: (value: string) => void;
  onItemSelect?: (item: SelectItem) => void;

  // Data handling
  items: SelectItem[];
  itemLabelProp?: string;

  // Styling and behavior
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;

  // Form integration
  name?: string;
  formItemProps?: any;

  // Create functionality
  allowCreate?: boolean;
  createLabel?: string;
  onCreateNew?: (name: string) => Promise<SelectItem>;
  createButtonText?: string;
}

export function SearchableSelect({
  // Display configuration
  placeholder = "Select an item",
  searchPlaceholder = "Search...",
  noResultsText = "No results found.",
  label,

  // Value handling
  value,
  onChange,
  onItemSelect,

  // Data handling
  items,
  itemLabelProp = "name",

  // Styling and behavior
  error,
  disabled,
  required,
  clearable = true,
  size = "md",
  className,

  // Form integration
  name,
  formItemProps,

  // Create functionality
  allowCreate = false,
  createLabel = "item",
  onCreateNew,
  createButtonText,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [selectedItem, setSelectedItem] = React.useState<SelectItem | null>(null);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [isCreating, setIsCreating] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const commandInputRef = React.useRef<HTMLInputElement>(null);
  const commandListRef = React.useRef<HTMLDivElement>(null);

  // Filter items based on search term
  const filteredItems = React.useMemo(() => {
    if (!debouncedSearchTerm) return items;
    return items.filter((item) =>
      item[itemLabelProp].toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
    );
  }, [items, debouncedSearchTerm, itemLabelProp]);

  // Check if current search term matches any existing item (use immediate searchTerm for faster response)
  const exactMatch = React.useMemo(() => {
    if (!searchTerm) return null;
    return items.find((item) => item[itemLabelProp].toLowerCase() === searchTerm.toLowerCase());
  }, [items, searchTerm, itemLabelProp]);

  // Show create option when:
  // 1. allowCreate is true
  // 2. There's a search term (use immediate searchTerm for instant response)
  // 3. No exact match exists
  // 4. Not currently creating
  // 5. Search term has some content (trimmed)
  const showCreateOption = allowCreate && searchTerm.trim() && !exactMatch && !isCreating;

  // Set initial selected item
  React.useEffect(() => {
    if (value && items.length > 0) {
      const item = items.find((i) => i.id === value);
      if (item) {
        setSelectedItem(item);
      }
    }
  }, [value, items]);

  // Reset highlighted index when filtered items change
  React.useEffect(() => {
    const totalItems = filteredItems.length + (showCreateOption ? 1 : 0);
    setHighlightedIndex(totalItems > 0 ? 0 : -1);
  }, [filteredItems, showCreateOption, open]);

  // Handle selection
  const handleSelect = (item: SelectItem) => {
    setSelectedItem(item);
    onChange?.(item.id);
    onItemSelect?.(item);
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Handle create new item
  const handleCreateNew = async () => {
    const termToUse = debouncedSearchTerm || searchTerm.trim();
    if (!onCreateNew || !termToUse) return;

    setIsCreating(true);
    try {
      const newItem = await onCreateNew(termToUse);
      handleSelect(newItem);
      setSearchTerm("");
    } catch (error) {
      console.error("Error creating new item:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(null);
    onChange?.("");
    onItemSelect?.(null as any);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Return early if dropdown is not open
    if (!open) return;

    const totalItems = filteredItems.length + (showCreateOption ? 1 : 0);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const nextIndex = prev < totalItems - 1 ? prev + 1 : 0;
          scrollToItem(nextIndex);
          return nextIndex;
        });
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const nextIndex = prev > 0 ? prev - 1 : totalItems - 1;
          scrollToItem(nextIndex);
          return nextIndex;
        });
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
          handleSelect(filteredItems[highlightedIndex]);
        } else if (showCreateOption && highlightedIndex === filteredItems.length) {
          handleCreateNew();
        }
        break;

      case "Escape":
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;

      case "Tab":
        setOpen(false);
        break;

      default:
        break;
    }
  };

  // Scroll the highlighted item into view
  const scrollToItem = (index: number) => {
    if (!commandListRef.current) return;

    const listItems = commandListRef.current.querySelectorAll("[cmdk-item]");
    if (index >= 0 && index < listItems.length) {
      listItems[index].scrollIntoView({
        block: "nearest",
      });
    }
  };

  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-10",
    lg: "h-12 text-lg",
  };

  // Focus the input when dropdown opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        commandInputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  const content = (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className={cn(
            "w-full justify-between",
            sizeClasses[size],
            error && "border-red-500",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
        >
          {selectedItem ? (
            <span className="flex items-center gap-2 truncate">{selectedItem[itemLabelProp]}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {selectedItem ? (
            <div className="flex items-center gap-1">
              <X
                className="h-4 w-4 shrink-0 cursor-pointer opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            </div>
          ) : (
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command onKeyDown={handleKeyDown}>
          <div className="flex items-center border-b px-3">
            <CommandInput
              ref={commandInputRef}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="h-9 border-0 focus:ring-0"
            />
          </div>
          <CommandList ref={commandListRef}>
            {filteredItems.length > 0 && (
              <CommandGroup>
                {filteredItems.map((item, index) => (
                  <CommandItem
                    key={item.id}
                    value={item[itemLabelProp]}
                    onSelect={() => handleSelect(item)}
                    className={cn("cursor-pointer", highlightedIndex === index && "bg-accent")}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    aria-selected={highlightedIndex === index}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedItem?.id === item.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {item[itemLabelProp]}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {showCreateOption && (
              <>
                {filteredItems.length > 0 && <CommandSeparator />}
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreateNew}
                    className={cn(
                      "cursor-pointer",
                      highlightedIndex === filteredItems.length && "bg-accent",
                    )}
                    onMouseEnter={() => setHighlightedIndex(filteredItems.length)}
                    disabled={isCreating}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {createButtonText || `Create "${searchTerm.trim()}"`}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
            {filteredItems.length === 0 && !showCreateOption && (
              <CommandEmpty>{noResultsText}</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  if (formItemProps) {
    return (
      <FormItem {...formItemProps}>
        {label && (
          <FormLabel
            className={cn(
              "text-muted-foreground",
              required && "after:ml-0.5 after:text-red-500 after:content-['*']",
            )}
          >
            {label}
          </FormLabel>
        )}
        <FormControl>{content}</FormControl>
        <FormMessage />
      </FormItem>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <p
          className={cn(
            "font-medium text-sm",
            required && "after:ml-0.5 after:text-red-500 after:content-['*']",
          )}
        >
          {label}
        </p>
      )}
      {content}
    </div>
  );
}