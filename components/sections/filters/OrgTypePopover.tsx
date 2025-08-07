"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select organisation type"
          className={cn(
            "h-12 w-full justify-between bg-white border-[var(--border)] text-[var(--ink)] hover:border-[var(--cta-end)] transition-colors",
            className
          )}
        >
          <span className="text-sm truncate">
            {selectedLabel ? (
              <span className="text-[var(--ink)]">{selectedLabel}</span>
            ) : (
              <span className="text-[var(--muted)]">Organisation Type</span>
            )}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4" align="start">
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