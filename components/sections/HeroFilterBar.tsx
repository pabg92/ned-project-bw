"use client";

import { ChevronRight, Users, Building2, Briefcase, Target } from "lucide-react";
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
    <div className={cn("space-y-3", className)}>
      {/* Filter Controls */}
      <div id="hero-filters" className="space-y-3">
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
            icon={<Users className="w-4 h-4" />}
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
            icon={<Briefcase className="w-4 h-4" />}
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
            icon={<Building2 className="w-4 h-4" />}
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
            icon={<Target className="w-4 h-4" />}
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
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={() => {
            update({ roles: ['cfo'], orgType: 'pe' });
            setTimeout(() => {
              document.getElementById('featured-experts')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="px-3 py-1.5 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--accent-soft)] text-xs font-medium text-[var(--ink)] transition-colors"
        >
          CFO · PE-backed
        </button>
        <button
          onClick={() => {
            update({ roles: ['chair'], orgType: 'public' });
            setTimeout(() => {
              document.getElementById('featured-experts')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="px-3 py-1.5 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--accent-soft)] text-xs font-medium text-[var(--ink)] transition-colors"
        >
          Chair · Listed
        </button>
        <button
          onClick={() => {
            update({ roles: ['advisor'], sectors: ['industrial'] });
            setTimeout(() => {
              document.getElementById('featured-experts')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="px-3 py-1.5 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--accent-soft)] text-xs font-medium text-[var(--ink)] transition-colors"
        >
          COO · Industrial
        </button>
        <button
          onClick={() => {
            update({ roles: ['ned'], specialisms: ['technology'] });
            setTimeout(() => {
              document.getElementById('featured-experts')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="px-3 py-1.5 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--accent-soft)] text-xs font-medium text-[var(--ink)] transition-colors"
        >
          NED · Tech
        </button>
        <button
          onClick={() => {
            update({ roles: ['sid'], sectors: ['financial-services'] });
            setTimeout(() => {
              document.getElementById('featured-experts')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="px-3 py-1.5 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--accent-soft)] text-xs font-medium text-[var(--ink)] transition-colors"
        >
          SID · Finance
        </button>
    </div>
  );
}