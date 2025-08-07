"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { decodeQuery, encodeQuery, mergeFilters, hasActiveFilters, countActiveFilters } from "./url";
import type { SearchFilters, RoleType, OrgType, Specialism, Sector } from "./types";

interface UseSearchFiltersReturn {
  filters: SearchFilters;
  update: (patch: Partial<SearchFilters>, pushToSearch?: boolean) => void;
  toggle: (type: keyof SearchFilters, value: string) => void;
  clear: () => void;
  hasActive: boolean;
  activeCount: number;
}

export function useSearchFilters(): UseSearchFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Decode current filters from URL
  const filters = useMemo<SearchFilters>(
    () => decodeQuery(new URLSearchParams(searchParams.toString())), 
    [searchParams]
  );

  // Update filters and optionally navigate to search
  const update = useCallback((patch: Partial<SearchFilters>, pushToSearch = false) => {
    const next = mergeFilters(filters, patch);
    const qs = encodeQuery(next);
    
    if (pushToSearch && pathname !== "/search") {
      // Navigate to search page with filters
      router.push(`/search${qs ? `?${qs}` : ""}`);
    } else {
      // Update current page URL
      const url = qs ? `${pathname}?${qs}` : pathname;
      router.push(url);
    }
  }, [filters, router, pathname]);

  // Toggle individual filter values
  const toggle = useCallback((type: keyof SearchFilters, value: string) => {
    if (type === "orgType") {
      // Single select - toggle on/off
      const current = filters.orgType;
      update({ orgType: current === value ? null : value as OrgType });
    } else {
      // Multi-select arrays
      const current = filters[type] as string[];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      update({ [type]: next } as Partial<SearchFilters>);
    }
  }, [filters, update]);

  // Clear all filters
  const clear = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  // Computed properties
  const hasActive = useMemo(() => hasActiveFilters(filters), [filters]);
  const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

  return {
    filters,
    update,
    toggle,
    clear,
    hasActive,
    activeCount,
  };
}

// Helper hook for individual filter types
export function useFilterToggle(
  type: keyof SearchFilters,
  value: string
): [boolean, () => void] {
  const { filters, toggle } = useSearchFilters();
  
  const isActive = useMemo(() => {
    if (type === "orgType") {
      return filters.orgType === value;
    }
    return (filters[type] as string[]).includes(value);
  }, [filters, type, value]);

  const handleToggle = useCallback(() => {
    toggle(type, value);
  }, [toggle, type, value]);

  return [isActive, handleToggle];
}