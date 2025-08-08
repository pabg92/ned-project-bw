"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchFilters } from "@/lib/search/useSearchFilters";
import { ROLE_TYPES, ORG_TYPES, SECTORS, SPECIALISMS } from "@/lib/search/filter-data";
import { SimpleDropdown } from "./filters/SimpleDropdown";
import { ActiveChips } from "./filters/ActiveChips";
import { cn } from "@/lib/utils";

interface HeroFilterBarProps {
  className?: string;
}

export default function HeroFilterBar({ className }: HeroFilterBarProps) {
  const { filters, update, clear, hasActive } = useSearchFilters();

  const handleFindExpert = () => {
    // Navigate to search page with current filters
    update({}, true);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Controls */}
      <div id="hero-filters" className="rounded-lg border border-[var(--border)] p-4 md:p-5 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Role Type - Multi-select */}
          <SimpleDropdown
            label="Role"
            value={filters.roles}
            options={ROLE_TYPES.map(r => ({ value: r.slug, label: r.label }))}
            onChange={(roles) => update({ roles: roles as string[] })}
            multiSelect={true}
            searchPlaceholder="Search roles..."
            emptyText="No roles found."
            className="min-w-[140px]"
          />
          
          {/* Sector - Multi-select with search */}
          <SimpleDropdown
            label="Sector"
            value={filters.sectors}
            options={SECTORS.map(s => ({ value: s.slug, label: s.label }))}
            onChange={(sectors) => update({ sectors: sectors as string[] })}
            multiSelect={true}
            searchPlaceholder="Search sectors..."
            emptyText="No sectors found."
            className="min-w-[140px]"
          />
          
          {/* Organisation Type - Single-select */}
          <SimpleDropdown
            label="Organisation Type"
            value={filters.orgType || undefined}
            options={ORG_TYPES.map(o => ({ value: o.slug, label: o.label }))}
            onChange={(orgType) => update({ orgType: (orgType as string) || null })}
            multiSelect={false}
            searchPlaceholder="Search organisation types..."
            emptyText="No organisation types found."
            className="min-w-[140px]"
          />
          
          {/* Specialism - Multi-select with search */}
          <SimpleDropdown
            label="Specialism"
            value={filters.specialisms}
            options={SPECIALISMS.map(s => ({ value: s.slug, label: s.label }))}
            onChange={(specialisms) => update({ specialisms: specialisms as string[] })}
            multiSelect={true}
            searchPlaceholder="Search specialisms..."
            emptyText="No specialisms found."
            className="min-w-[140px]"
          />
        </div>
        
        {/* CTA Section */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleFindExpert}
            className="h-12 px-6 rounded-lg bg-gradient-to-b from-[var(--cta-start)] to-[var(--cta-end)] text-white font-semibold hover:from-[var(--hover-start)] hover:to-[var(--hover-end)] transition-all group"
            aria-label="Find an expert with selected filters"
          >
            Find an Expert
            <ChevronRight className="ml-2 h-5 w-5 inline-block group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={clear}
            className="h-10 px-4 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--bg-subtle)] transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      
      {/* Active Filter Chips */}
      {hasActive && (
        <ActiveChips className="px-1" />
      )}
    </div>
  );
}