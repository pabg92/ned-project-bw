import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center h-8 px-3 rounded-full border text-[13px] font-medium transition-all focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[rgba(90,130,189,0.7)]",
  {
    variants: {
      variant: {
        default:
          "bg-[#E8EFFA] border-[#B7C7E7] text-[var(--ink)] hover:bg-[#DCE7F8]",
        secondary:
          "bg-[#F1F5F9] border-[#E2E8F0] text-[var(--muted)] hover:bg-[#E2E8F0]",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "bg-white border-[var(--border)] text-[var(--muted)] hover:bg-[var(--bg-subtle)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
