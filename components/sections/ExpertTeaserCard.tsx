"use client";
import Link from "next/link";
import { useSearchFilters } from "@/lib/search/useSearchFilters";
import { buildSignupUrl } from "@/lib/search/signup";

export default function ExpertTeaserCard() {
  const { filters } = useSearchFilters();
  const href = buildSignupUrl(filters, "home_hero");

  return (
    <aside className="bg-white border border-[var(--border)] rounded-card p-4 md:p-5">
      <div className="text-[12px] uppercase tracking-wider text-[var(--muted)]">For board-level leaders</div>
      <h3 className="font-display tracking-[var(--track-display)] leading-[var(--lh-display-tight)] text-[clamp(22px,2.2vw,26px)] mt-1 text-[var(--ink)]">
        Join our vetted NED &amp; Advisor network
      </h3>
      <p className="text-[14px] leading-6 mt-2 text-[var(--muted)]">
        Confidential introductions to PE-backed and listed boards. Share availability once — we handle diligence and matching.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <Link
          href={href}
          className="inline-flex h-10 px-5 items-center justify-center rounded-btn border border-[#8595d5] text-[#8595d5] hover:bg-[#EFF6FF] text-[14px] font-semibold transition-colors"
          data-analytics='{"action":"join_click","source":"home_hero"}'
        >
          Join as Expert
        </Link>
        <Link href="/signup#eligibility" className="text-[12px] text-[#8595d5] hover:underline">
          What we look for
        </Link>
      </div>
      <div className="mt-2 text-[12px] text-[var(--muted)]">Zero fees for talent · Profiles reviewed by our team</div>
    </aside>
  );
}