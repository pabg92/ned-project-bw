"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchFilters } from "@/lib/search/useSearchFilters";
import { ROLE_TYPES, ORG_TYPES, SECTORS, SPECIALISMS } from "@/lib/search/filter-data";
import { RolePopover } from "./filters/RolePopover";
import { OrgTypePopover } from "./filters/OrgTypePopover";
import { ComboMulti } from "./filters/ComboMulti";
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
      <div className="rounded-card border border-[var(--border)] p-4 md:p-5 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Role Type - Multi-select checkboxes */}
          <RolePopover
            value={filters.roles}
            onChange={(roles) => update({ roles })}
            options={ROLE_TYPES}
          />
          
          {/* Sector - Multi-select combobox with search */}
          <ComboMulti
            label="Sector"
            value={filters.sectors}
            options={SECTORS.map(s => ({ value: s.slug, label: s.label }))}
            onChange={(sectors) => update({ sectors })}
            placeholder="Select sectors..."
            searchPlaceholder="Search sectors..."
            emptyText="No sectors found."
          />
          
          {/* Organisation Type - Single-select radio */}
          <OrgTypePopover
            value={filters.orgType || undefined}
            onChange={(orgType) => update({ orgType: orgType || null })}
            options={ORG_TYPES}
          />
          
          {/* Specialism - Multi-select combobox */}
          <ComboMulti
            label="Specialism"
            value={filters.specialisms}
            options={SPECIALISMS.map(s => ({ value: s.slug, label: s.label }))}
            onChange={(specialisms) => update({ specialisms })}
            placeholder="Select specialisms..."
            searchPlaceholder="Search specialisms..."
            emptyText="No specialisms found."
          />
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleFindExpert}
            className="inline-flex items-center justify-center h-11 px-5 rounded-btn text-white shadow-btn [background:var(--cta-grad)] hover:[background:var(--hover-grad)] transition-all duration-200 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[rgba(90,130,189,0.9)] font-semibold group w-full sm:w-auto"
            aria-label="Find an expert with selected filters"
          >
            Find an Expert
            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {hasActive && (
            <Button
              variant="outline"
              onClick={clear}
              className="h-11 px-5 w-full sm:w-auto border-[var(--cta-end)] text-[var(--cta-end)] hover:bg-[#EFF6FF]"
              aria-label="Clear all filters"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      
      {/* Active Filter Chips */}
      {hasActive && (
        <ActiveChips className="px-1" />
      )}
    </div>
  );
}