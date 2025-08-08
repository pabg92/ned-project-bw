import { encodeQuery } from "./url";

export function buildSignupUrl(filters: {
  roles?: string[]; 
  sectors?: string[]; 
  specialisms?: string[]; 
  orgType?: string | null;
}, source: "home_hero" | "chips_tray" | "footer") {
  const qs = encodeQuery({
    roles: filters.roles ?? [],
    specialisms: filters.specialisms ?? [],
    sectors: filters.sectors ?? [],
    orgType: filters.orgType ?? null,
  });
  const utm = `utm_source=${source}&utm_medium=link&utm_campaign=expert_join`;
  return qs ? `/signup?${utm}&${qs}` : `/signup?${utm}`;
}