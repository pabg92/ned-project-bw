"use client";

import { useSearchFilters } from "@/lib/search/useSearchFilters";

interface Preset {
  label: string;
  filters: {
    roles?: string[];
    orgType?: string | null;
    sectors?: string[];
    specialisms?: string[];
  };
}

export default function HeroQuickPresets() {
  const { update } = useSearchFilters();

  const presets: Preset[] = [
    { 
      label: "CFO · PE-backed", 
      filters: { roles: ["advisor"], specialisms: ["finance"], orgType: "pe" }
    },
    { 
      label: "Chair · Listed", 
      filters: { roles: ["chair"], orgType: "public" }
    },
    { 
      label: "COO · Industrial", 
      filters: { roles: ["advisor"], specialisms: ["operations"], sectors: ["industrial"] }
    },
    { 
      label: "CMO · Consumer", 
      filters: { roles: ["advisor"], specialisms: ["marketing"], sectors: ["consumer-retail"] }
    },
    { 
      label: "CIO · SaaS", 
      filters: { roles: ["advisor"], specialisms: ["technology"], sectors: ["tech-software"] }
    },
    { 
      label: "SID · Financial Services", 
      filters: { roles: ["sid"], sectors: ["financial-services"] }
    },
  ];

  const applyPreset = (preset: Preset) => {
    // Apply the preset filters
    update({
      roles: preset.filters.roles || [],
      orgType: preset.filters.orgType || null,
      sectors: preset.filters.sectors || [],
      specialisms: preset.filters.specialisms || [],
    });

    // Smooth scroll to experts section after a brief delay
    setTimeout(() => {
      const expertsSection = document.getElementById('featured-experts');
      if (expertsSection) {
        expertsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {presets.map((preset) => (
        <button
          key={preset.label}
          className="chip focus-ring transition-colors"
          onClick={() => applyPreset(preset)}
          aria-label={`Apply filter preset: ${preset.label}`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}