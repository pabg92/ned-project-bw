// NED Advisor Filter Data - Single Source of Truth
// Non-executive and advisory appointments taxonomy

import type { SectorData, SpecialismData } from "./types";

// Role Types - NED focused (excludes executive roles like CEO/MD)
export const ROLE_TYPES = [
  { slug: "chair", label: "Chair" },
  { slug: "ned", label: "Non-Executive Director" },
  { slug: "sid", label: "Senior Independent Director" },
  { slug: "advisor", label: "Advisor" },
  { slug: "trustee", label: "Trustee" },
] as const;

// Organisation Types
export const ORG_TYPES = [
  { slug: "pe", label: "PE-Backed" },
  { slug: "public", label: "Public (Listed)" },
  { slug: "private", label: "Private (Unlisted)" },
  { slug: "venture", label: "Venture-Backed / Growth" },
  { slug: "family", label: "Family-Owned" },
  { slug: "charity", label: "Charity / Non-Profit" },
  { slug: "public-sector", label: "Public Sector / Gov" },
  { slug: "vc-pe-firm", label: "VC / PE Firm" },
] as const;

// Sectors with synonyms for search expansion
export const SECTORS: SectorData[] = [
  { 
    slug: "tech-software", 
    label: "Technology, Software & IT Services", 
    synonyms: ["SaaS", "Cybersecurity", "AI", "ML", "Cloud", "DevOps", "Data"] 
  },
  { 
    slug: "financial-services", 
    label: "Financial Services & FinTech", 
    synonyms: ["Payments", "WealthTech", "InsurTech", "Banking", "Asset Management", "RegTech"] 
  },
  { 
    slug: "healthcare", 
    label: "Healthcare, Life Sciences & MedTech", 
    synonyms: ["Pharma", "CRO", "HealthTech", "Digital Health", "Biotech", "Medical Devices"] 
  },
  { 
    slug: "consumer-retail", 
    label: "Consumer Goods, Retail & E-commerce", 
    synonyms: ["D2C", "Luxury", "Marketplace", "Fashion", "Beauty", "FMCG"] 
  },
  { 
    slug: "industrial", 
    label: "Industrial & Manufacturing", 
    synonyms: ["Advanced Manufacturing", "Engineering", "Automation", "Supply Chain", "IoT"] 
  },
  { 
    slug: "professional-services", 
    label: "Business & Professional Services", 
    synonyms: ["Consulting", "Outsourcing", "Facilities", "Recruitment", "Legal Services"] 
  },
  { 
    slug: "media-creative", 
    label: "Media, Advertising & Creative", 
    synonyms: ["MarTech", "Publishing", "Gaming", "AdTech", "Content", "Entertainment"] 
  },
  { 
    slug: "energy-cleantech", 
    label: "Energy, Utilities & Cleantech", 
    synonyms: ["Renewables", "Oil & Gas", "Solar", "Wind", "Carbon Tech", "Sustainability"] 
  },
  { 
    slug: "realestate-proptech", 
    label: "Real Estate & PropTech", 
    synonyms: ["Commercial Property", "Construction Tech", "REITs", "Property Management"] 
  },
  { 
    slug: "construction", 
    label: "Construction & Infrastructure", 
    synonyms: ["Civil Engineering", "Building Materials", "Project Management", "Smart Buildings"] 
  },
  { 
    slug: "transport-logistics", 
    label: "Transport, Logistics & Supply Chain", 
    synonyms: ["3PL", "Fleet", "Last-mile", "Freight", "Mobility", "Delivery"] 
  },
  { 
    slug: "food-bev-hospitality", 
    label: "Food, Beverage & Hospitality", 
    synonyms: ["QSR", "Restaurant Tech", "Food Tech", "Hotels", "Catering"] 
  },
  { 
    slug: "leisure-travel", 
    label: "Leisure, Travel & Tourism", 
    synonyms: ["Attractions", "OTA", "Airlines", "Cruise", "Events", "Sports"] 
  },
  { 
    slug: "education", 
    label: "Education & Training", 
    synonyms: ["EdTech", "Corporate L&D", "Higher Ed", "K-12", "Online Learning"] 
  },
  { 
    slug: "agri", 
    label: "Agriculture & Agritech", 
    synonyms: ["Food Production", "Agri-services", "Precision Agriculture", "Vertical Farming"] 
  },
  { 
    slug: "aerospace-defence", 
    label: "Aerospace, Defence & Security", 
    synonyms: ["Space", "Cyber-defence", "MRO", "Defense Tech", "Aviation"] 
  },
  { 
    slug: "telecoms", 
    label: "Telecommunications & Networking", 
    synonyms: ["Telco", "5G", "Infrastructure", "Satellite", "Network Services"] 
  },
  { 
    slug: "public-nonprofit", 
    label: "Public Sector & Not-for-Profit", 
    synonyms: ["GovTech", "NGOs", "Social Enterprise", "Impact", "Foundations"] 
  },
];

// Specialisms with title mappings
export const SPECIALISMS: SpecialismData[] = [
  { 
    slug: "finance", 
    label: "Finance", 
    titles: ["CFO", "Finance Director", "Group FC", "Head of Finance", "VP Finance", "Treasurer"] 
  },
  { 
    slug: "operations", 
    label: "Operations / Transformation", 
    titles: ["COO", "Operations Director", "Transformation Director", "Programme Director", "VP Operations"] 
  },
  { 
    slug: "commercial", 
    label: "Commercial & Growth", 
    titles: ["CCO", "CRO", "Sales Director", "BD Director", "Commercial Director", "Revenue Officer"] 
  },
  { 
    slug: "marketing", 
    label: "Marketing & Brand", 
    titles: ["CMO", "Chief Brand Officer", "Marketing Director", "VP Marketing", "Head of Brand"] 
  },
  { 
    slug: "technology", 
    label: "Technology & Digital", 
    titles: ["CTO", "CIO", "CDO", "IT Director", "VP Engineering", "Head of Technology"] 
  },
  { 
    slug: "people", 
    label: "People & Culture", 
    titles: ["CPO", "CHRO", "HR Director", "People Director", "Head of Talent", "VP People"] 
  },
  { 
    slug: "legal-risk", 
    label: "Legal, Risk & Governance", 
    titles: ["General Counsel", "Company Secretary", "CRO", "Head of Compliance", "Chief Risk Officer", "Legal Director"] 
  },
  { 
    slug: "strategy-mna", 
    label: "Strategy & M&A", 
    titles: ["CSO", "M&A Director", "Corporate Development", "Head of Strategy", "VP Strategy"] 
  },
  { 
    slug: "product-innovation", 
    label: "Product & Innovation", 
    titles: ["CPO", "Product Director", "R&D Director", "Innovation Director", "VP Product"] 
  },
  { 
    slug: "specialist", 
    label: "Specialist / Regulated", 
    titles: ["Chief Medical Officer", "Chief Sustainability Officer", "Chief Data Officer", "Regulatory Affairs Director"] 
  },
];

// Helper functions for search expansion
export function getSectorSynonyms(sectorSlug: string): string[] {
  const sector = SECTORS.find(s => s.slug === sectorSlug);
  return sector ? [sector.label, ...sector.synonyms] : [];
}

export function getSpecialismTitles(specialismSlug: string): string[] {
  const specialism = SPECIALISMS.find(s => s.slug === specialismSlug);
  return specialism ? [specialism.label, ...specialism.titles] : [];
}

// Executive roles (hidden from NED Advisor, available for BoardChampions)
export const EXECUTIVE_ROLES = [
  { slug: "ceo", label: "CEO / Managing Director", hidden: true },
  { slug: "president", label: "President / COO", hidden: true },
] as const;