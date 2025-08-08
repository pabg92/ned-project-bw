import Image from "next/image";

export default function AccoladesCard() {
  return (
    <aside className="[background:var(--awards-grad)] border border-[var(--border)] rounded-card p-5">
      <div className="text-[12px] uppercase tracking-wider text-[var(--muted)] mb-3">Trusted by leaders</div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { n: "2,500+", l: "Board Appointments" },
          { n: "500+", l: "PE Portfolio" },
          { n: "100+", l: "FTSE Listed" },
        ].map((s) => (
          <div key={s.l} className="bg-white rounded-md border border-[var(--border)] h-20 flex flex-col items-center justify-center">
            <div className="font-display text-[22px] leading-none text-[var(--cta-start)]">{s.n}</div>
            <div className="text-[12px] text-[var(--muted)] text-center">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2 flex-wrap">
        <span className="px-2.5 h-7 inline-flex items-center rounded-full bg-[#E8EFFA] border border-[#B7C7E7] text-[12px] text-[var(--ink)]">
          Verified Network
        </span>
        <span className="px-2.5 h-7 inline-flex items-center rounded-full bg-[#E8EFFA] border border-[#B7C7E7] text-[12px] text-[var(--ink)]">
          Due Diligence
        </span>
      </div>

      {/* Award logos row */}
      <div className="mt-4 flex items-center gap-3">
        <Image
          src="/board-champions-assets/champions-awards/fast-track.webp"
          alt="Fast Track Award"
          width={60}
          height={24}
          className="h-6 w-auto object-contain grayscale opacity-60"
        />
        <Image
          src="/board-champions-assets/champions-awards/1000-companies.webp"
          alt="1000 Companies Award"
          width={60}
          height={24}
          className="h-6 w-auto object-contain grayscale opacity-60"
        />
        <Image
          src="/board-champions-assets/champions-awards/breakthrough-50-awards.webp"
          alt="Breakthrough 50 Award"
          width={60}
          height={24}
          className="h-6 w-auto object-contain grayscale opacity-60"
        />
      </div>
    </aside>
  );
}