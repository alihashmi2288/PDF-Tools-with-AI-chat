import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Apple Primary: #3B82F6 with hover #2563EB & active #1D4ED8
        default:
          "bg-primary text-white hover:bg-primary-hover active:bg-primary-focus rounded-[8px] border border-transparent shadow-xs font-medium",
        primary:
          "bg-primary text-white hover:bg-primary-hover active:bg-primary-focus rounded-[8px] border border-transparent shadow-xs font-medium",

        // Apple Secondary: Surface with hairline border & subtle hover
        secondary:
          "bg-surface-1 text-ink hover:bg-surface-2 hover:border-hairline-strong rounded-[8px] border border-hairline shadow-xs font-medium",

        // Apple Tertiary / Transparent
        tertiary:
          "bg-transparent text-ink hover:bg-surface-2 hover:text-primary rounded-[8px] border border-transparent",

        // Apple Inverse: Pure white on dark / clean contrast
        inverse:
          "bg-white text-black hover:bg-neutral-100 rounded-[8px] border border-transparent font-medium shadow-xs",

        // Apple Outline
        outline:
          "border border-hairline bg-transparent text-ink hover:bg-surface-2 hover:border-hairline-strong rounded-[8px]",

        destructive:
          "bg-destructive text-white hover:bg-destructive/90 rounded-[8px] shadow-xs font-medium",

        ghost:
          "text-ink-muted hover:text-ink hover:bg-surface-2 rounded-[8px]",

        link:
          "text-primary underline-offset-4 hover:underline hover:text-primary-hover p-0 h-auto rounded-none",

        pill:
          "bg-primary text-white hover:bg-primary-hover active:bg-primary-focus rounded-full font-medium shadow-xs",
        "pill-secondary":
          "bg-surface-1 text-ink border border-hairline hover:bg-surface-2 hover:border-hairline-strong rounded-full font-medium shadow-xs",

        // Segmented control / filter tab variant
        category:
          "bg-surface-2/60 text-ink-subtle border border-hairline hover:text-ink hover:border-hairline-strong rounded-full font-medium transition-all",
        "category-active":
          "bg-primary text-white border border-primary rounded-full font-medium shadow-xs",
      },
      size: {
        default: "h-8.5 px-3.5 text-xs rounded-[8px]",
        sm: "h-7 px-2.5 text-xs rounded-[6px]",
        lg: "h-10 px-5 text-sm rounded-[8px]",
        pill: "h-9 px-4 text-xs sm:text-sm rounded-full",
        "pill-sm": "h-7 px-3 text-xs rounded-full",
        icon: "size-8 rounded-[8px]",
        "icon-sm": "size-7 rounded-[6px]",
        "icon-circular": "size-8 rounded-full border border-hairline bg-surface-1 text-ink hover:bg-surface-2 shadow-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
