import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-[6px] border border-border bg-card px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground shadow-xs transition-all outline-none",
        "focus-visible:border-foreground/40 focus-visible:ring-1 focus-visible:ring-foreground/20",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
