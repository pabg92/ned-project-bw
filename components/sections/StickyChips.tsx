"use client";

import * as React from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSearchFilters } from "@/lib/search/useSearchFilters";
import { buildSignupUrl } from "@/lib/search/signup";
import { ROLE_TYPES, ORG_TYPES, SECTORS, SPECIALISMS } from "@/lib/search/filter-data";
import { cn } from "@/lib/utils";

interface StickyChipsProps {
  className?: string;
}

export default function StickyChips({ className }: StickyChipsProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const { filters, toggle, clear, hasActive, activeCount } = useSearchFilters();
  
  // Show sticky bar when scrolled past hero (approx 600px)
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Don't render if not visible or no active filters
  if (!isVisible || !hasActive) return null;
  
  const chips: { type: string; value: string; label: string }[] = [];
  
  // Collect active filters
  filters.roles.forEach(role => {
    const label = ROLE_TYPES.find(r => r.slug === role)?.label;
    if (label) chips.push({ type: "roles", value: role, label });
  });
  
  if (filters.orgType) {
    const label = ORG_TYPES.find(o => o.slug === filters.orgType)?.label;
    if (label) chips.push({ type: "orgType", value: filters.orgType, label });
  }
  
  filters.specialisms.forEach(spec => {
    const label = SPECIALISMS.find(s => s.slug === spec)?.label;
    if (label) chips.push({ type: "specialisms", value: spec, label });
  });
  
  filters.sectors.forEach(sector => {
    const label = SECTORS.find(s => s.slug === sector)?.label;
    if (label) chips.push({ type: "sectors", value: sector, label });
  });
  
  const scrollToHero = () => {
    const heroFilters = document.getElementById('hero-filters');
    if (heroFilters) {
      heroFilters.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  
  return (
    <div 
      className={cn(
        "sticky top-[64px] z-40 bg-white/95 backdrop-blur-sm shadow-sm transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 gap-4">
          {/* Active Chips */}
          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            <span className="text-xs text-[var(--muted)] font-medium whitespace-nowrap">
              Filters ({activeCount}):
            </span>
            <div className="flex items-center gap-2">
              {chips.slice(0, 5).map((chip, index) => (
                <Badge
                  key={`${chip.type}-${chip.value}-${index}`}
                  variant="secondary"
                  className="h-7 pl-2 pr-1 gap-1 bg-[#E8EFFA] border-[#B7C7E7] text-[var(--ink)] whitespace-nowrap"
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
              {chips.length > 5 && (
                <span className="text-xs text-[var(--muted)]">
                  +{chips.length - 5} more
                </span>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={clear}
              className="text-xs text-[var(--cta-start)] hover:text-[var(--hover-start)] transition-colors font-medium"
              aria-label="Clear all filters"
            >
              Clear all
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToHero}
              className="h-8 px-3 border-[var(--cta-end)] text-[var(--cta-end)] hover:bg-[#EFF6FF]"
            >
              <SlidersHorizontal className="h-3 w-3 mr-1" />
              Refine
            </Button>
            <a
              href={buildSignupUrl(filters, "chips_tray")}
              className="text-[#8595d5] text-[12px] hover:underline whitespace-nowrap"
              aria-label="I'm an expert — join our network"
            >
              I'm an expert — join
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}