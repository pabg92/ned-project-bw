"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { controlClass, caretClass } from "@/components/ui/Control";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface UnifiedFilterProps {
  label: string;
  value: string | string[] | undefined;
  options: { value: string; label: string }[];
  onChange: (value: string | string[] | undefined) => void;
  multiSelect?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  showSearch?: boolean;
}

export function UnifiedFilter({
  label,
  value,
  options,
  onChange,
  multiSelect = false,
  searchPlaceholder,
  emptyText = "No results found.",
  className,
  showSearch = true,
}: UnifiedFilterProps) {
  const [open, setOpen] = React.useState(false);
  
  // Ensure popover closes on escape or outside click
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open]);

  const normalizedValue = React.useMemo(() => {
    if (multiSelect) {
      return Array.isArray(value) ? value : [];
    }
    return typeof value === "string" ? value : undefined;
  }, [value, multiSelect]);

  const handleSelect = (optionValue: string) => {
    if (multiSelect) {
      const currentValues = normalizedValue as string[];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      const newValue = normalizedValue === optionValue ? undefined : optionValue;
      onChange(newValue);
      if (newValue !== undefined) {
        setOpen(false);
      }
    }
  };

  const getDisplayText = () => {
    if (multiSelect) {
      const values = normalizedValue as string[];
      if (values.length > 0) {
        return (
          <span className="flex items-center gap-1">
            <span className="text-[var(--ink)]">{label}</span>
            <span className="ml-1 text-xs text-[var(--accent-strong)]">({values.length})</span>
          </span>
        );
      }
    } else {
      const singleValue = normalizedValue as string | undefined;
      if (singleValue) {
        const selectedOption = options.find(opt => opt.value === singleValue);
        if (selectedOption) {
          return <span className="text-[var(--ink)]">{selectedOption.label}</span>;
        }
      }
    }
    return <span className="text-[var(--control-placeholder)]">{label}</span>;
  };

  const hasValue = multiSelect 
    ? (normalizedValue as string[]).length > 0
    : normalizedValue !== undefined;

  const effectiveSearchPlaceholder = searchPlaceholder || `Search ${label.toLowerCase()}...`;

  const shouldShowSearch = showSearch && options.length > 5;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          aria-label={`Select ${label}`}
          className={cn(controlClass, "w-full justify-between flex items-center", className)}
          data-state={open ? "open" : "closed"}
        >
          <span className="text-sm truncate">{getDisplayText()}</span>
          <ChevronDown className={caretClass} data-state={open ? "open" : "closed"} />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] bg-white border border-[var(--control-border)] rounded-lg shadow-[var(--elevation-menu)] p-0 z-50" 
        align="start"
        sideOffset={4}
        forceMount={false}
      >
        <Command>
          {shouldShowSearch && (
            <CommandInput 
              placeholder={effectiveSearchPlaceholder}
              className="h-10 border-b border-[var(--control-border)]"
            />
          )}
          <CommandEmpty className="px-3 py-2 text-[var(--muted)]">{emptyText}</CommandEmpty>
          <CommandList className="max-h-[280px] overflow-auto">
            <CommandGroup>
              {options.map((option) => {
                const isSelected = multiSelect
                  ? (normalizedValue as string[]).includes(option.value)
                  : normalizedValue === option.value;
                
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                    className="h-9 px-3 text-[14px] cursor-pointer data-[selected=true]:bg-[var(--accent-soft)] data-[highlighted=true]:bg-[var(--accent-soft)] flex items-center"
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4 text-[var(--accent-strong)] flex-shrink-0",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex-1 text-left">{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          {hasValue && (
            <div className="border-t border-[var(--control-border)] p-2">
              <button
                onClick={() => onChange(multiSelect ? [] : undefined)}
                className="text-xs text-[var(--cta-start)] hover:text-[var(--hover-start)] transition-colors px-2 py-1"
                aria-label={`Clear ${label} selection`}
              >
                Clear {multiSelect ? "all" : "selection"}
              </button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}