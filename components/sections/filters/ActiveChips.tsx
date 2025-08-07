"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSearchFilters } from "@/lib/search/useSearchFilters";
import { ROLE_TYPES, ORG_TYPES, SECTORS, SPECIALISMS } from "@/lib/search/filter-data";
import { cn } from "@/lib/utils";

interface ActiveChipsProps {
  className?: string;
}

export function ActiveChips({ className }: ActiveChipsProps) {
  const { filters, toggle, clear } = useSearchFilters();
  
  const chips: { type: string; value: string; label: string }[] = [];
  
  // Add role chips
  filters.roles.forEach(role => {
    const label = ROLE_TYPES.find(r => r.slug === role)?.label;
    if (label) {
      chips.push({ type: "roles", value: role, label });
    }
  });
  
  // Add org type chip
  if (filters.orgType) {
    const label = ORG_TYPES.find(o => o.slug === filters.orgType)?.label;
    if (label) {
      chips.push({ type: "orgType", value: filters.orgType, label });
    }
  }
  
  // Add specialism chips
  filters.specialisms.forEach(spec => {
    const label = SPECIALISMS.find(s => s.slug === spec)?.label;
    if (label) {
      chips.push({ type: "specialisms", value: spec, label });
    }
  });
  
  // Add sector chips
  filters.sectors.forEach(sector => {
    const label = SECTORS.find(s => s.slug === sector)?.label;
    if (label) {
      chips.push({ type: "sectors", value: sector, label });
    }
  });
  
  if (chips.length === 0) return null;
  
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {chips.map((chip, index) => (
        <Badge
          key={`${chip.type}-${chip.value}-${index}`}
          variant="secondary"
          className="h-7 pl-2 pr-1 gap-1 bg-[#E8EFFA] border-[#B7C7E7] text-[var(--ink)] hover:bg-[#DCE7F8]"
        >
          <span className="text-xs">{chip.label}</span>
          <button
            onClick={() => toggle(chip.type as any, chip.value)}
            className="ml-1 rounded-full outline-none hover:bg-[var(--border)] p-0.5 transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {chips.length > 1 && (
        <button
          onClick={clear}
          className="text-xs text-[var(--cta-start)] hover:text-[var(--hover-start)] transition-colors font-medium"
          aria-label="Clear all filters"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

// Compact variant for inline display
export function ActiveChipsCompact({ className }: ActiveChipsProps) {
  const { filters, activeCount, clear } = useSearchFilters();
  
  if (activeCount === 0) return null;
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant="secondary" 
        className="h-6 px-2 bg-[#E8EFFA] border-[#B7C7E7] text-[var(--ink)]"
      >
        <span className="text-xs font-medium">{activeCount} filter{activeCount !== 1 && 's'}</span>
      </Badge>
      <button
        onClick={clear}
        className="text-xs text-[var(--cta-start)] hover:text-[var(--hover-start)] transition-colors"
        aria-label="Clear all filters"
      >
        Clear
      </button>
    </div>
  );
}