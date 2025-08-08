"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface ComboMultiProps {
  label: string;
  value: string[];
  options: { value: string; label: string }[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

export function ComboMulti({
  label,
  value = [],
  options,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
}: ComboMultiProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabels = value
    .map(v => options.find(opt => opt.value === v)?.label)
    .filter(Boolean);

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

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
          <span className="text-sm truncate">
            {value.length > 0 ? (
              <span className="flex items-center gap-1">
                <span className="text-[var(--ink)]">{label}</span>
                <span className="ml-1 text-xs text-[var(--accent-strong)]">({value.length})</span>
              </span>
            ) : (
              <span className="text-[var(--control-placeholder)]">{label}</span>
            )}
          </span>
          <ChevronDown className={caretClass} data-state={open ? "open" : "closed"} />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] bg-white border border-[var(--control-border)] rounded-lg shadow-[var(--elevation-menu)] p-0" 
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder}
            className="h-10 border-b border-[var(--control-border)]"
          />
          <CommandEmpty className="px-3 py-2 text-[var(--muted)]">{emptyText}</CommandEmpty>
          <CommandList className="max-h-[280px] overflow-auto">
          <CommandGroup>
            {options.map((option) => {
              const isSelected = value.includes(option.value);
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
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Variant with inline chips display
export function ComboMultiWithChips({
  label,
  value = [],
  options,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
}: ComboMultiProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={`Select ${label}`}
            className="h-12 w-full justify-between bg-white border-[var(--border)] text-[var(--ink)] hover:border-[var(--cta-end)] transition-colors"
          >
            <span className="text-sm">
              {value.length > 0 ? `${label} (${value.length})` : label}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder={searchPlaceholder}
              className="h-9"
            />
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map(v => {
            const option = options.find(opt => opt.value === v);
            if (!option) return null;
            return (
              <Badge
                key={v}
                variant="secondary"
                className="h-7 pl-2 pr-1 gap-1"
              >
                {option.label}
                <button
                  onClick={() => handleRemove(v)}
                  className="ml-1 rounded-full outline-none hover:bg-[var(--border)] p-0.5"
                  aria-label={`Remove ${option.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}