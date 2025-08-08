"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { controlClass, caretClass } from "@/components/ui/Control";

interface SimpleDropdownProps {
  label: string;
  value: string | string[] | undefined;
  options: { value: string; label: string }[];
  onChange: (value: string | string[] | undefined) => void;
  multiSelect?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  showSearch?: boolean;
  icon?: React.ReactNode;
}

export function SimpleDropdown({
  label,
  value,
  options,
  onChange,
  multiSelect = false,
  searchPlaceholder,
  emptyText = "No results found.",
  className,
  showSearch = true,
  icon,
}: SimpleDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);


  // Normalize value
  const normalizedValue = React.useMemo(() => {
    if (multiSelect) {
      return Array.isArray(value) ? value : [];
    }
    return typeof value === "string" ? value : undefined;
  }, [value, multiSelect]);

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    return options.filter(opt => 
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // Handle outside clicks
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearchQuery("");
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

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
        setSearchQuery("");
      }
    }
  };

  const getDisplayText = () => {
    if (multiSelect) {
      const values = normalizedValue as string[];
      if (values.length > 0) {
        return (
          <span className="flex items-center gap-1.5">
            {icon && <span className="text-[var(--accent-strong)]">{icon}</span>}
            <span className="text-[var(--ink)]">{label}</span>
            <span className="text-xs font-medium text-[var(--accent-strong)]">+{values.length}</span>
          </span>
        );
      }
    } else {
      const singleValue = normalizedValue as string | undefined;
      if (singleValue) {
        const selectedOption = options.find(opt => opt.value === singleValue);
        if (selectedOption) {
          return (
            <span className="flex items-center gap-1.5">
              {icon && <span className="text-[var(--accent-strong)]">{icon}</span>}
              <span className="text-[var(--ink)]">{selectedOption.label}</span>
            </span>
          );
        }
      }
    }
    return (
      <span className="flex items-center gap-1.5 text-[var(--control-placeholder)]">
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </span>
    );
  };

  const hasValue = multiSelect 
    ? (normalizedValue as string[]).length > 0
    : normalizedValue !== undefined;

  const shouldShowSearch = showSearch && options.length > 5;

  return (
    <div className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-label={`Select ${label}`}
        onClick={() => setOpen(!open)}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.99)';
          setTimeout(() => {
            e.currentTarget.style.transform = '';
          }, 80);
        }}
        className={cn(controlClass, "w-full justify-between flex items-center group transition-all duration-200")}
        data-state={open ? "open" : "closed"}
      >
        <span className="text-sm truncate flex-1">{getDisplayText()}</span>
        {hasValue && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(multiSelect ? [] : undefined);
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[var(--accent-soft)] rounded transition-opacity mr-1"
            aria-label="Clear selection"
          >
            <svg className="w-3 h-3 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <ChevronDown className={cn(caretClass, "transition-transform duration-200")} data-state={open ? "open" : "closed"} />
      </button>

      {open ? (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white border border-[var(--border)] rounded-lg shadow-[var(--elevation-menu)]"
          style={{ 
            minWidth: buttonRef.current?.offsetWidth || 200,
            maxHeight: '320px'
          }}
        >
          {shouldShowSearch && (
            <div className="p-2 border-b border-[var(--control-border)]">
              <div className="flex items-center gap-2 px-2">
                <Search className="h-4 w-4 text-[var(--muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder || `Search ${label.toLowerCase()}...`}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          <div className="max-h-[260px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-[var(--muted)]">{emptyText}</div>
            ) : (
              <div className="py-1">
                {filteredOptions.map((option) => {
                  const isSelected = multiSelect
                    ? (normalizedValue as string[]).includes(option.value)
                    : normalizedValue === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--accent-soft)] data-[selected=true]:bg-[var(--accent-soft)] transition-colors"
                      data-selected={isSelected}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 text-[var(--accent-strong)]",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="flex-1">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {hasValue && (
            <div className="border-t border-[var(--control-border)] p-2">
              <button
                type="button"
                onClick={() => {
                  onChange(multiSelect ? [] : undefined);
                  setSearchQuery("");
                }}
                className="text-xs text-[var(--cta-start)] hover:text-[var(--hover-start)] transition-colors px-2 py-1"
              >
                Clear {multiSelect ? "all" : "selection"}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}