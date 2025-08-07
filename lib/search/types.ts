// NED Advisor Search Filter Types
// Focused on non-executive and advisory appointments

export type RoleType = "chair" | "ned" | "sid" | "advisor" | "trustee";
export type OrgType = "pe" | "public" | "private" | "venture" | "family" | "charity" | "public-sector" | "vc-pe-firm";
export type Specialism =
  | "finance"
  | "operations"
  | "commercial"
  | "marketing"
  | "technology"
  | "people"
  | "legal-risk"
  | "strategy-mna"
  | "product-innovation"
  | "specialist";

export type Sector =
  | "tech-software"
  | "financial-services"
  | "healthcare"
  | "consumer-retail"
  | "industrial"
  | "professional-services"
  | "media-creative"
  | "energy-cleantech"
  | "realestate-proptech"
  | "construction"
  | "transport-logistics"
  | "food-bev-hospitality"
  | "leisure-travel"
  | "education"
  | "agri"
  | "aerospace-defence"
  | "telecoms"
  | "public-nonprofit";

export interface SearchFilters {
  roles: RoleType[];          // multi-select
  orgType?: OrgType | null;   // single-select
  specialisms: Specialism[];  // multi-select
  sectors: Sector[];          // multi-select
}

// For API responses
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// For sectors with synonyms
export interface SectorData {
  slug: Sector;
  label: string;
  synonyms: string[];
}

// For specialisms with title mappings
export interface SpecialismData {
  slug: Specialism;
  label: string;
  titles: string[];
}