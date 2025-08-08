"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { controlClass, caretClass } from "@/components/ui/Control";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { OrgType } from "@/lib/search/types";

interface OrgTypePopoverProps {
  value?: OrgType;
  onChange: (value?: OrgType) => void;
  options: readonly { slug: string; label: string }[];
  className?: string;
}

export function OrgTypePopover({
  value,
  onChange,
  options,
  className,
}: OrgTypePopoverProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel = value 
    ? options.find(opt => opt.slug === value)?.label 
    : null;

  const handleSelect = (newValue: string) => {
    if (newValue === value) {
      onChange(undefined); // Deselect if clicking the same value
    } else {
      onChange(newValue as OrgType);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          aria-label="Select organisation type"
          className={cn(controlClass, "w-full justify-between flex items-center", className)}
          data-state={open ? "open" : "closed"}
        >
          <span className="text-sm truncate">
            {selectedLabel ? (
              <span className="text-[var(--ink)]">{selectedLabel}</span>
            ) : (
              <span className="text-[var(--control-placeholder)]">Organisation Type</span>
            )}
          </span>
          <ChevronDown className={caretClass} data-state={open ? "open" : "closed"} />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-4 bg-white border border-[var(--control-border)] rounded-lg shadow-[var(--elevation-menu)]" 
        align="start"
        sideOffset={4}
      >
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[var(--ink)]">Organisation Type</h4>
          <RadioGroup
            value={value || ""}
            onValueChange={handleSelect}
            className="space-y-2"
          >
            {options.map((option) => (
              <div key={option.slug} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.slug}
                  id={`org-${option.slug}`}
                  className="border-[var(--border)] text-[var(--cta-start)] data-[state=checked]:border-[var(--cta-start)]"
                  aria-label={`Select ${option.label}`}
                />
                <Label
                  htmlFor={`org-${option.slug}`}
                  className="text-sm font-normal cursor-pointer flex-1 py-1"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {value && (
            <div className="pt-2 border-t border-[var(--border)]">
              <button
                onClick={() => onChange(undefined)}
                className="text-xs text-[var(--cta-start)] hover:text-[var(--hover-start)] transition-colors"
                aria-label="Clear organisation type selection"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}