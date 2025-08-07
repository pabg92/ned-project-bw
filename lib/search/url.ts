// URL Encoding/Decoding for Search Filters
// CSV-based arrays for clean URLs

import { z } from "zod";
import type { RoleType, OrgType, Specialism, Sector, SearchFilters } from "./types";

// Transform CSV strings to arrays
const csv = z.string().transform(s => s.split(",").filter(Boolean));

// URL Query Schema
export const QuerySchema = z.object({
  roles: csv.optional(),          // e.g., roles=chair,ned,sid
  orgType: z.string().optional(), // single value
  specialisms: csv.optional(),    // e.g., specialisms=finance,operations
  sectors: csv.optional(),        // e.g., sectors=tech-software,healthcare
});

// Decode URL search params to filters
export function decodeQuery(searchParams: URLSearchParams): SearchFilters {
  const params = Object.fromEntries(searchParams);
  const parsed = QuerySchema.safeParse(params);
  
  if (!parsed.success) {
    return { 
      roles: [], 
      specialisms: [], 
      sectors: [], 
      orgType: null 
    };
  }
  
  const { roles = [], orgType, specialisms = [], sectors = [] } = parsed.data;
  
  return {
    roles: roles as RoleType[],
    orgType: (orgType ?? null) as OrgType | null,
    specialisms: specialisms as Specialism[],
    sectors: sectors as Sector[],
  };
}

// Encode filters to URL query string
export function encodeQuery(filters: SearchFilters): string {
  const params = new URLSearchParams();
  
  if (filters.roles?.length) {
    params.set("roles", filters.roles.join(","));
  }
  if (filters.orgType) {
    params.set("orgType", filters.orgType);
  }
  if (filters.specialisms?.length) {
    params.set("specialisms", filters.specialisms.join(","));
  }
  if (filters.sectors?.length) {
    params.set("sectors", filters.sectors.join(","));
  }
  
  return params.toString();
}

// Helper to merge filter updates
export function mergeFilters(
  current: SearchFilters, 
  update: Partial<SearchFilters>
): SearchFilters {
  return {
    roles: update.roles ?? current.roles,
    orgType: update.orgType !== undefined ? update.orgType : current.orgType,
    specialisms: update.specialisms ?? current.specialisms,
    sectors: update.sectors ?? current.sectors,
  };
}

// Helper to check if filters are empty
export function hasActiveFilters(filters: SearchFilters): boolean {
  return !!(
    filters.roles.length ||
    filters.orgType ||
    filters.specialisms.length ||
    filters.sectors.length
  );
}

// Helper to count active filters
export function countActiveFilters(filters: SearchFilters): number {
  return (
    filters.roles.length +
    (filters.orgType ? 1 : 0) +
    filters.specialisms.length +
    filters.sectors.length
  );
}