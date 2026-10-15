import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-ring select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        // App / Chrome Default (6px square)
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 rounded-[6px] border border-transparent shadow-xs",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 rounded-[6px]",
        outline:
          "border border-border bg-card text-foreground hover:bg-muted/80 hover:border-foreground/20 rounded-[6px] shadow-xs",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-[6px] border border-border/40",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-secondary/70 rounded-[6px]",
        link:
          "text-link underline-offset-4 hover:underline p-0 h-auto rounded-none",

        // Bimodal Marketing Pills from DESIGN.md
        pill:
          "bg-[#171717] text-white hover:bg-[#2e2e2e] dark:bg-white dark:text-black dark:hover:bg-[#ededed] rounded-[100px] border border-transparent font-medium shadow-xs",
        "pill-secondary":
          "bg-card text-foreground border border-border hover:border-foreground/30 rounded-[100px] font-medium shadow-xs",
        
        // Category Pill
        category:
          "bg-card text-muted-foreground border border-border hover:text-foreground hover:border-foreground/20 rounded-[64px] font-medium",
        "category-active":
          "bg-primary text-primary-foreground border border-primary rounded-[64px] font-medium shadow-xs",
      },
      size: {
        default: "h-8 px-3 text-xs",
        sm: "h-7 px-2 text-xs rounded-[6px]",
        lg: "h-10 px-5 text-sm",
        pill: "h-10 px-5 text-[14px]",
        "pill-sm": "h-8 px-4 text-xs",
        icon: "size-8 rounded-[6px]",
        "icon-sm": "size-7 rounded-[6px]",
        "icon-circular": "size-8 rounded-full border border-border bg-card text-foreground hover:bg-secondary/80",
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
