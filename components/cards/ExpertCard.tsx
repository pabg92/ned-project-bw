"use client";

import Image from "next/image";
import Link from "next/link";

interface ExpertCardProps {
  id: number;
  name: string;
  title: string;
  image: string;
  tags?: string[];
}

export default function ExpertCard({ id, name, title, image, tags = [] }: ExpertCardProps) {
  return (
    <article className="group card-surface keyline-top card-surface-hover focus-ring">
      {/* Premium image container with 4:5 aspect */}
      <div className="aspect-[4/5] overflow-hidden rounded-t-[16px]">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          width={400}
          height={500}
          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      {/* Content with proper spacing */}
      <div className="p-5 space-y-2">
        <h3 className="font-display text-[20px] leading-tight text-[var(--ink)]">
          {name}
        </h3>
        <p className="text-[14px] leading-6 text-[var(--muted)] line-clamp-1">
          {title}
        </p>
        
        {/* Optional tag row - 2-3 max */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 rounded-full bg-[var(--bg-subtle)] text-[var(--muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Premium CTA row */}
        <div className="mt-3 flex items-center gap-3">
          <button className="h-10 px-4 rounded-lg border border-[var(--border)] bg-white hover:bg-[var(--bg-subtle)] text-[var(--ink)] font-medium text-[14px] transition-colors focus-ring">
            Enquire
          </button>
          <Link 
            href={`/expert/${id}`} 
            className="text-[14px] text-[var(--accent-strong)] hover:underline group/link"
          >
            View profile 
            <span className="inline-block transition-transform group-hover/link:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}