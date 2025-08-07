"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select role types"
          className={cn(
            "h-12 w-full justify-between bg-white border-[var(--border)] text-[var(--ink)] hover:border-[var(--cta-end)] transition-colors",
            className
          )}
        >
          <span className="text-sm truncate">
            {value.length > 0 ? (
              <span className="flex items-center gap-1">
                <span>Role</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {value.length}
                </Badge>
              </span>
            ) : (
              <span className="text-[var(--muted)]">Role</span>
            )}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4" align="start">
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