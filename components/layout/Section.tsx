"use client"

type Variant = "light" | "subtle" | "stats" | "cta" | "darkFooter" | "darkTestimonial";

export default function Section({
  variant = "light",
  className = "",
  children,
}: React.PropsWithChildren<{
  variant?: Variant;
  className?: string;
}>) {
  const backgrounds = {
    light: "bg-white",
    subtle: "bg-[#F9FAFB]",
    stats: "[background:var(--stats-grad)]",
    cta: "[background:var(--cta-grad)]",
    darkFooter: "[background:var(--footer-grad)]",
    darkTestimonial: "[background:var(--testi-grad-dark)]",
  };

  const bg = backgrounds[variant];

  return (
    <section className={`pt-24 pb-20 ${bg} ${className}`}>
      {children}
    </section>
  );
}