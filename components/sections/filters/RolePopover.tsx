"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { controlClass, caretClass } from "@/components/ui/Control";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import type { RoleType } from "@/lib/search/types";

interface RolePopoverProps {
  value: RoleType[];
  onChange: (value: RoleType[]) => void;
  options: readonly { slug: string; label: string }[];
  className?: string;
}

export function RolePopover({
  value = [],
  onChange,
  options,
  className,
}: RolePopoverProps) {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (role: string) => {
    const newValue = value.includes(role as RoleType)
      ? value.filter(v => v !== role)
      : [...value, role as RoleType];
    onChange(newValue);
  };

  const selectedLabels = value
    .map(v => options.find(opt => opt.slug === v)?.label)
    .filter(Boolean);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          aria-label="Select role types"
          className={cn(controlClass, "w-full justify-between flex items-center", className)}
          data-state={open ? "open" : "closed"}
        >
          <span className="text-sm truncate">
            {value.length > 0 ? (
              <span className="flex items-center gap-1">
                <span className="text-[var(--ink)]">Role</span>
                <span className="ml-1 text-xs text-[var(--accent-strong)]">({value.length})</span>
              </span>
            ) : (
              <span className="text-[var(--control-placeholder)]">Role</span>
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
          <h4 className="text-sm font-medium text-[var(--ink)]">Role Types</h4>
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.slug} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${option.slug}`}
                  checked={value.includes(option.slug as RoleType)}
                  onCheckedChange={() => handleToggle(option.slug)}
                  className="data-[state=checked]:bg-[var(--cta-start)] data-[state=checked]:border-[var(--cta-start)]"
                  aria-label={`Select ${option.label}`}
                />
                <Label
                  htmlFor={`role-${option.slug}`}
                  className="text-sm font-normal cursor-pointer flex-1 py-1"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
          {value.length > 0 && (
            <div className="pt-2 border-t border-[var(--border)]">
              <button
                onClick={() => onChange([])}
                className="text-xs text-[var(--cta-start)] hover:text-[var(--hover-start)] transition-colors"
                aria-label="Clear all role selections"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}